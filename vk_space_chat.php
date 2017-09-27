<?php 
	session_start();
	$_SESSION["vk_vis_a_vis_rooms"]["true_connection"] = "true";
?>

<!DOCTYPE html>
<html> 
<head>
<meta charset="UTF-8" /> 
<link rel="stylesheet" href="./vk_space_chat.css" />
<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">

<script src="../games_resources/libs/AdapterJS-master/publish/adapter.min.js"></script>
<script src='../games_resources/libs/three.js-87/build/three.min.js'></script>
<script src='../games_resources/libs/three.js-87/examples/js/controls/FlyControls.js'></script>
<script src='../games_resources/libs/three.js-87/examples/js/renderers/CSS3DRenderer.js'></script>
<script src='../games_resources/libs/three.js-87/examples/js/loaders/ColladaLoader2.js'></script>
<script src="../games_resources/libs/jquery.js"></script>
<script src="../games_resources/libs/peer.min.js"></script>

<script src="./vk_space_chat_meshes_base.js"></script>
<script src="./vk_space_chat_constants_and_general_functions.js"></script>
<script src="./vk_space_chat_net_messages.js"></script>
<script src="./vk_space_chat_person.js"></script>
<script src="./vk_space_chat.js"></script>
<script src="./vk_space_chat_store_window.js"></script>
<script src="./vk_space_chat_menu.js"></script>
<script src="./vk_space_chat_users.js"></script>
<script src="./vk_space_chat_visual_keeper.js"></script>
<script src="./vk_space_chat_hint.js"></script>
<script src="./vk_space_chat_my_controls.js"></script>
<script src="./vk_space_chat_flying_objects.js"></script>
<script src="./vk_space_chat_user_chat_controls.js"></script>
<script src="./vk_space_chat_collecting_objects.js"></script>
<script src="./vk_space_chat_bad_blocks.js"></script>
<script src="./vk_space_chat_global_objects.js"></script>

<script src="https://vk.com/js/api/xd_connection.js?2"  type="text/javascript"></script>
</head>

<body>
<div id="training_page_div">
	<div id="close_training_page_div_button">Закрыть</div>
	<video width=600 height=415 src="./video/vis_a_vis_video.mp4"  controls></video>
	<p class="p_class">
		Ваша цель перемещаться между комнатами для общения с другими игроками! Чтобы перейти в следующую комнату, Вам необходимо набрать >= 1000 очков. Чтобы набрать очки можно собирать кубы определенного цвета, которые видите только Вы. Так же очки даются за общение с другими пользователями (нужно прилететь к другому пользователю так близко, пока вы не услышите звук). Все пользователи могут видеть и слышать друг друга, если подлетят на достаточно близкое расстояние. Заводите новых друзей, летайте и развлекайтесь с Визави (Vis-a-Vis).
	</p>
	<img src="./models/screens/1_description.png" width=600 height=412 style="left: 50%;" />
	<p class="p_class">
		При переходах между комнатами, Вы можете попасть не к другим пользователям, а в комнату со странными злыми существами - Охотниками. Они будут стремиться выбросить Вас из игры! Чтобы не допустить этого, Вам нужно как можно скорее раздобыть >= 1000 очков для перехода в следующую комнату! (и не факт, что Вас снова не забросит к Охотникам :) 
		Вот так они выглядят:
	</p>
	<img src="./models/screens/4.png" width=600 height=412 style="align: center;" />
	<p class="p_class">
		Очки начисляются только за сбор кубов того вида, что изображен у Вас на экране внизу! 
		Таких кубов в одной комнате 5-7.  
	</p>
	<p class="p_class">
		WASD: движение вперед, влево, назад, вправо. Мышка: поворот. 
		RQ: поворот вокруг оси направления. 
	</p>
	<p class="p_class">
		Shift: Лететь быстро. 
	</p>
	<p class="p_class">
		Других игроков Вы можете распознать по необычной траектории движения, так же у их кубов есть отмечены грани :) 
	</p>
	<p class="p_class">
		Разрешите доступ к видеокамере и микрофону в диалоге выбора, в меню игры. 
	</p>
	<p class="p_class">
		Чтобы собрать куб - пролетите через него! 
	</p>
	<p class="p_class">
		Стоимость куба = 200 очков 
	</p>
	<p class="p_class">
		За вход в зону другого игрока дается так же 200 очков. 
	</p>
	<p class="p_class">
		Когда Вы подлетаете к другому игроку достаточно близко, его куб становится все более прозрачным. На близком расстоянии Вы услышите другого игрока. 
	</p>
	<p class="p_class">
		Разработано с использованием библиотек: Three.js, Peer.js, jQuery
	</p>
</div>


<script>

if(typeof(VK) !== "undefined")
{
	VK.init(function() { 
	    window.VK_WAS_INIT = true; 
	//    createCallFriendsList();
	}, function() { 
	    window.VK_WAS_INIT = false;
	}, '5.63'); 
}

AdapterJS.webRTCReady(function(isUsingPlugin) {

if(isUsingPlugin === true)
	window.isUsingPlugin = true;


	window.Peer = new Peer({
		host: PEER_SERVER_ADDR, 
		port: PEER_PORT_ADDR, 
		path: PEER_PATH_ADDR,
		debug: true
	});


	window.Peer.on("open", function () {

		var GLOBAL_OBJECTS = new _GlobalObjects();
	});
	window.Peer.on("error", function (err) {
		switch(err.type)
		{
			case "browser-incompatible":
				var error_div = document.createElement("div");
				var text = "Ваш веб-браузер не поддерживает необходимых технологий :( Для работы работы с приложением рекомендуется использовать последнюю версию Google Chrome или Mozilla Firefox ;)";
				error_div.appendChild(document.createTextNode(text));
				error_div.setAttribute("id", "on_tech_error");
				document.body.appendChild(error_div);
			break;
		}
	});

});
</script>
</body>
</html>

