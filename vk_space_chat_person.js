/*
Класс описывает структуру, в которой будут храниться все необходимые данные
характеризующие текущую клиентскую сессию!
Здесь хранятся все данные получаемые с сервера:
параметры внешнего вида VisualKeeper'а клиента, которые сохраняются и меняются в Store.
ID - Внутрипрограммный идентификатор пользователя, пока что не используется;
Nickname - Никнейм пользователя. Пока что не используется;
UserType - описывает тип пользователя. Удаленный/локальный.
*/


var _Person = function (json_params)
{

	this.onCheckSuccessBF = this.onCheckSuccess.bind(this);
	this.setLoadedCustomViewParametersBF = this.setLoadedCustomViewParameters.bind(this);
	this.onSaveOpenMeshesToDBSuccessBF = this.onSaveOpenMeshesToDBSuccess.bind(this);

	/*ИДшник для использования в приложении*/
	this.ID = null;
	/*Если нужно использовать Никнеймы*/
	this.Nickname = null;
	/*Тип пользователя*/
	this.UserType = null;
	/*
	Хранит данные Вконтакта для текущей сессии пользователя.
	Данные типа vk_id и т.д.
	*/
	this.VKVars = {};
	/*	Меши открытые пользователем для использования.*/
	this.OpenMeshes = [];
	/*
	Объект для Кейса локального пользователя, на который ДОЛЖЕН ссылаться
	его VisualKeeper.VideoMesh.Case
	*/
	this.VideoMesh = {};
	this.VideoMesh.CaseMeshIndex = CASE_MESHES_INDEXES.CUBE;
	this.VideoMesh.Case = null; /*Любой Меш. Может быть равен this.VideoMesh.CubeMeshCase*/
	this.VideoMesh.CubeMeshCase = null; /*Существует для каждого пользователя и загружается при заходе*/
	this.setVideoMeshCaseByMeshIndex();

	/*Далее идут действия, которые выполняются только для локального пользователя*/
	if(json_params instanceof Object)
	{
		this.UserType = json_params.user_type;
	} else 
	{
		throw new Error("We have a BIG PROBLEM!");
	}

	if(this.UserType === USER_TYPES.LOCAL){
		this.generateID();
		this.generateNickname();
		if(window.VK_WAS_INIT === true)
		{
			this.parseVKVars();
			this.checkPersonAtDB();
		}

	}

};

_Person.prototype.checkMeshIndexInOpenMeshes = function (mesh_index)
{
	for(var i=0; i< this.OpenMeshes.length; i++)
	{
		if(this.OpenMeshes[i] === mesh_index)
		{
			throw new Error("Этот Меш уже был куплен!");
		} else
		{
			this.OpenMeshes.push(mesh_index);
		}
	}
};

/*устанавливает параметры передаваемые сообщением REQUESTS.UTOU.GetYourFullDataMessage | REQUESTS.UTOU.SendMyFullDataMessage*/
_Person.prototype.setRemotePersonParameters = function(json_params)
{
	this.setUserVKID(this.json_params.vk_id);
	this.setCubeVideoMeshCaseParametersJSON(json_params);
	this.setCaseMeshIndex(json_params.mesh_case_index);
	this.setVideoMeshCaseByMeshIndex();
};

/*Устанавливает текущий Mesh по индексу.*/
_Person.prototype.setVideoMeshCaseByMeshIndex = function (index)
{
	if(typeof(index) !== "undefined" && typeof(index) !== "null")
	{
		this.VideoMesh.Case = GLOBAL_OBJECTS.getMeshesBase().getMeshCopyByIndex(index);
	}else
	{
		this.VideoMesh.Case = GLOBAL_OBJECTS.getMeshesBase().getMeshCopyByIndex(this.VideoMesh.CaseMeshIndex);
	}
};
/*Структура возвращает данные от структуры КУБА.*/
_Person.prototype.getCubeVideoMeshCaseParametersJSON = function ()
{
	return {
		opacity: this.VideoMesh.Case.material.opacity, 
		face_color: this.VideoMesh.Case.material.color.getHex(), 
		edge_color: this.VideoMesh.Case.children[0].material.color.getHex()
	};
};
/*Функция вроде как устанавливает необходимые параметры и материалы структуры КУБА*/
_Person.prototype.setCubeVideoMeshCaseParametersJSON = function (json_params)
{
		this.VideoMesh.CubeCaseMesh.material.opacity = json_params.opacity;
		this.VideoMesh.CubeCaseMesh.material.color.setHex(json_params.face_color);
		this.VideoMesh.CubeCaseMesh.children[0].material.color.setHex(json_params.edge_color);
};
/*
IN: 
json_params: {
	open_meshes: []
}
*/
_Person.prototype.saveOpenMeshesToDB = function (json_params)
{
	this.topen_meshes = "";
	for(var i=0; i< json_params.open_meshes.length; i++)
	{
		this.topen_meshes += json_params.open_meshes[i];
		if(i !== (json_params.open_meshes.length - 1))
		{
			this.topen_meshes += ",";
		}
	}
	var send_data = "datas=" + JSON.stringify({
		operation: "save_open_meshes",
		vk_id: this.Person.getUserVKID(),
		open_meshes: this.topen_meshes
	});

	$.ajax({
		type: "POST",
		url: "./mysql.php",
		async: true,
		success: this.onSaveOpenMeshesToDBSuccessBF,
		data: send_data,
		contentType: "application/x-www-form-urlencoded",
		error: function (jqXHR, textStatus,errorThrown) { console.log(errorThrown + " " + textStatus);}

	});	
};
/*Ёбаный обработчик успешного сохранения*/
_Person.prototype.onSaveOpenMeshesToDBSuccess = function (json_params)
{
	alert(json_params);
};

/*Загружает сохраненные настройки вида с сервера*/ 
_Person.prototype.loadSavedCustomViewParameters = function ()
{
	var send_data = "datas=" + JSON.stringify({
		operation: "get_custom_mesh_view_params",
		user_id: this.Person.getUserVKID()
	});
	$.ajax({
		type: "POST",
		url: "./mysql.php",
		async: true,
		success: this.setLoadedCustomViewParametersBF,
		data: send_data,
		contentType: "application/x-www-form-urlencoded",
		error: function (jqXHR, textStatus,errorThrown) { console.log(errorThrown + " " + textStatus);}

	});	
};



/*Принимает и устанавливает полученные с сервера параметры к пользовательскому Мешу*/
_Person.prototype.setLoadedCustomViewParameters = function (json_params)
{
	if(typeof(json_params) === "string")
	{
		json_params = JSON.parse(json_params);
	}

	alert(json_params);
	/*Если сервер сказал, что данные доступны!*/
	if(json_params["server_answer"] === "YES_DATA")
	{
		this.VideoMesh.Case.material.color.setHex(json_params["result_datas"]["color"]);
		this.VideoMesh.Case.material.opacity = parseFloat(json_params["result_datas"]["opacity"]);
		this.VideoMesh.CaseMeshIndex = json_params["result_datas"]["case_mesh_index"];
		this.OpenMeshes = json_params["result_datas"]["open_meshes"].split(",");

	} else if(json_params["server_answer"] === "NO_DATA")
	{
		console.log("User hasn't custom view VisualKeeper parameters");
	} else
	{
		console.log("something is wrong :(");
	}
};

/*Функция занимается разбором url-строки, из которой получает все необходимые данные пользователя*/
_Person.prototype.parseVKVars = function ()
{
	this.VKVars = {};
	this.VKVars.user_id = 0;
	var answr = location.search;
	answr = answr.split("&");
	for (var i = 0; i < answr.length; i++) {
		answr[i] = answr[i].split('=');//Создание двумерного массива
		this.VKVars[answr[i][0]] = answr[i][1];//Создание объекта, со свойствами двумерного массива.
	}
	if (this.VKVars.user_id == 0) {
		this.VKVars.user_id = this.VKVars.viewer_id;
	}

};

_Person.prototype.getCaseMeshIndex = function ()
{
	return this.VideoMesh.CaseMeshIndex;
};

_Person.prototype.setCaseMeshIndex = function (index)
{
	this.VideoMesh.CaseMeshIndex = index;
};

_Person.prototype.setNickname = function (nick)
{
	this.Nickname = nick;
};

_Person.prototype.generateID = function ()
{
	this.ID = generateRandomString(11);
};


_Person.prototype.generateNickname = function ()
{
	this.Nickname = generateRandomString(11);
};


_Person.prototype.getNickname = function ()
{
	return this.Nickname;
};


_Person.prototype.getID = function ()
{
	return this.ID;
};

_Person.prototype.getUserVKID = function ()
{
	return this.VKVars.user_id;
};

_Person.prototype.setUserVKID = function (json_params)
{
	this.VKVars.user_id = json_params.vk_id;
};

_Person.prototype.getAccessToken = function ()
{
	return this.VKVars.access_token;
};

_Person.prototype.checkPersonAtDB = function ()
{		
	var send_data = "datas=" + JSON.stringify({
		vk_id: this.getUserVKID(),
		date_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
		operation: "check_and_save_user"
	});
	$.ajax({
		type: "POST",
		url: "./mysql.php",
		async: true,
		success: this.onCheckSuccessBF,
		data: send_data,
		contentType: "application/x-www-form-urlencoded",
		error: function (jqXHR, textStatus,errorThrown) { console.log(errorThrown + " " + textStatus);}

	});
};
_Person.prototype.onCheckSuccess = function (json_params)
{
	console.log(json_params);
	if(typeof(json_params) === "string")
	{
		json_params = JSON.parse(json_params);
	}
};