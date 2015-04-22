<?php
session_start();
$config = json_decode(file_get_contents("../config.json"));


$token = $_SESSION['token'];
if(empty($token)) {
	$scope = "email%20profile";
	$url = "https://accounts.google.com/o/oauth2/auth?scope=%s&redirect_uri=%s&response_type=code&client_id=%s";
	$googleLoginURL = sprintf($url, $scope, urlencode($config->oauth2->redirect_uri), $config->oauth2->client_id);
} else {

	require("/git/DatabasePDO/DatabasePDO.php");

	$url = "https://www.googleapis.com/oauth2/v3/userinfo";
	$curl = curl_init();
	$headers = array(
		"Authorization: Bearer " . $token,
		"GData-Version: 3.0",
	);
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($curl, CURLOPT_POST, false);
	$result = curl_exec($curl);
	curl_close($curl);

	$googleUser = json_decode($result);
	$googleId = $googleUser->sub;
	// name, email, gender, picture, email
	$_SESSION['googleId'] = $googleId;
}

if(!empty($googleId)) {
	$db = new DatabasePDO($config->db->host, $config->db->user, $config->db->password, $config->db->database);
	$user = $db->getRow("SELECT * FROM users WHERE google_id = ?", array($googleId));

	if(empty($user)) {
		$sql = "INSERT INTO users(google_id, name, email) VALUES(?,?,?);";
		$userId = $db->insert($sql, array($googleId, $googleUser->name, $googleUser->email));
		echo "user created";
		$user = $db->getRow("SELECT * FROM users WHERE user_id = ?", array($userId));
	} else {
		$userId = $user['user_id'];
	}


}
?>


<!doctype html>
<html>
	<head>
		<title>Chopper</title>
		<meta charset="utf-8" />
		<link rel="stylesheet" href="css/main.css" type="text/css" />
		<script src="js/Camera.js"></script>
		<script src="js/CharacterList.js"></script>
		<script src="js/Character.js"></script>
		<script src="js/Connection.js"></script>
		<script src="js/Game.js"></script>
		<?php if(isset($userId)) echo "<script>var userId='{$userId}'</script>"; ?>
	</head>
	<body>

		<?php if(isset($userId)): ?>
			<section class="user">
				<?php echo $user['name']; ?><br>
				<?php echo $user['email']; ?><br>
				<a href="logout.php">Logout</a>
			</section>

			<section class="connection">
				<div class="status"></div>
				<button type="button" class="connect">Connect</button>
			</section>

			<section class="game" style="display:none">
				<ul class="characters"></ul>
				<canvas id="canvas" width="800" height="600"></canvas>
			</section>



			<script src="js/main.js"></script>
		<?php else: ?>
			<a href="<?php echo $googleLoginURL;?>">Login using Google</a>
		<?php endif; ?>

	</body>
</html>