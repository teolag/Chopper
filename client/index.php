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

	$db = new DatabasePDO($config->db->host, $config->db->user, $config->db->password, $config->db->database);
	$user = $db->getRow("SELECT * FROM users WHERE google_id = ?", array($googleId));

	if(empty($user)) {
		$sql = "INSERT INTO users(google_id, name, email) VALUES(?,?,?);";
		$userId = $db->insert($sql, array($googleId, $googleUser->name, $googleUser->email));
		echo "user created";
		$user = $db->getRow("SELECT * FROM users WHERE google_id = ?", array($googleId));
	}


}
?>


<!doctype html>
<html>
	<head>
		<title>Chopper</title>
		<meta charset="utf-8" />
		<link rel="stylesheet" href="css/main.css" type="text/css" />
		<script src="js/CharacterList.js"></script>
		<?php if(isset($googleId)) echo "<script>var userId='{$userId}'</script>"; ?>
	</head>
	<body>

		<?php if(isset($googleId)): ?>
			<section class="user">
				<?php echo $user['name']; ?><br>
				<?php echo $user['email']; ?>
			</section>

			<section class="login">
				<ul class="characters"></ul>
			</section>

			<section class="play">


				<canvas id="canvas" width="800" height="600"></canvas>
			</section>
		<?php else: ?>
			<a href="<?php echo $googleLoginURL;?>">Login using Google</a>
		<?php endif; ?>

		<script src="js/main.js"></script>
	</body>
</html>