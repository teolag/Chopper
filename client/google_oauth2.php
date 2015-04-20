<?php
session_start();

$config = json_decode(file_get_contents("../config.json"));


if (isset($_GET['code'])) {


	$auth_code = $_GET["code"];


	$fields=array(
		'code'=>  urlencode($auth_code),
		'client_id'=>  urlencode($config->oauth2->client_id),
		'client_secret'=>  urlencode($config->oauth2->client_secret),
		'redirect_uri'=>  urlencode($config->oauth2->redirect_uri),
		'grant_type'=>  urlencode('authorization_code')
	);
	$post = '';
	foreach($fields as $key=>$value) {
		$post .= $key.'='.$value.'&';
	}
	$post = rtrim($post,'&');

	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL,'https://accounts.google.com/o/oauth2/token');
	curl_setopt($curl, CURLOPT_POST,5);
	curl_setopt($curl, CURLOPT_POSTFIELDS, $post);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
	$result = curl_exec($curl);
	curl_close($curl);

	$json = json_decode($result);

	$token = $json->access_token;
	$_SESSION['token'] = $token;
	echo "Token: " . $token . "<br>";



	//header("Location: index.php");
}

?>