<?php 


if(!defined('DB_USER')){
  require "../../config.php";		
  try {
      $conn = new PDO("mysql:host=". DB_HOST. ";dbname=". DB_DATABASE , DB_USER, DB_PASSWORD);
  } catch (PDOException $pe) {
      die("Could not connect to the database " . DB_DATABASE . ": " . $pe->getMessage());
  }
}
//Fetch User Details
try {
    $query = "SELECT * FROM interns_data WHERE username ='adeyefa'";
    $resultSet = $conn->query($query);
    $resultData = $resultSet->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e){
    throw $e;
}
$username = $resultData['username'];
$fullName = $resultData['name'];
$picture = $resultData['image_filename'];
//Fetch Secret Word
try{
    $querySecret =  "SELECT * FROM secret_word LIMIT 1";
    $resultSet   =  $conn->query($querySecret);
    $resultData  =  $resultSet->fetch(PDO::FETCH_ASSOC);
    $secret_word =  $resultData['secret_word'];
}catch (PDOException $e){
    throw $e;
}
$secret_word =  $resultData['secret_word'];

/*$result = $conn->query("Select * from secret_word LIMIT 1");
$result = $result->fetch(PDO::FETCH_OBJ);
$secret_word = $result->secret_word;
$result2 = $conn->query("Select * from interns_data where username = 'adeyefa'");
$user = $result2->fetch(PDO::FETCH_OBJ);*/

/////////////////////////////////

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

  require "../answers.php";

  date_default_timezone_set("Africa/Lagos");


  try{
    if(!isset($_POST['question'])){
      echo json_encode([
        'status' => 1,
        'answer' => "Please provide a question"
      ]);
      return;
    }
  
    $question = $_POST['question'];
    
    //check if in training mode
    $index_of_train = stripos($question, "train:");
    if($index_of_train === false){//then in question mode
      $question = preg_replace('([\s]+)', ' ', trim($question)); //remove extra white space from question
      $question = preg_replace("([?.])", "", $question); //remove ? and .
  
      //check if answer already exists in database
      $question = "%$question%";
      $sql = "select * from chatbot where question like :question";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':question', $question);
      $stmt->execute();
  
      $stmt->setFetchMode(PDO::FETCH_ASSOC);
      $rows = $stmt->fetchAll();
      if(count($rows)>0){
        $index = rand(0, count($rows)-1);
        $row = $rows[$index];
        $answer = $row['answer'];	
  
        //check if the answer is to call a function
        $index_of_parentheses = stripos($answer, "((");
        if($index_of_parentheses === false){ //then the answer is not to call a function
          echo json_encode([
            'status' => 1,
            'answer' => $answer
          ]);
        }else{//otherwise call a function. but get the function name first
          $index_of_parentheses_closing = stripos($answer, "))");
          if($index_of_parentheses_closing !== false){
            $function_name = substr($answer, $index_of_parentheses+2, $index_of_parentheses_closing-$index_of_parentheses-2);
            $function_name = trim($function_name);
            if(stripos($function_name, ' ') !== false){ //if method name contains spaces, do not invoke method
              echo json_encode([
                'status' => 0,
                'answer' => "The function name should not contain white spaces"
              ]);
              return;
            }
            if(!function_exists($function_name)){
              echo json_encode([
                'status' => 0,
                'answer' => "I am sorry but I could not find that function"
              ]);
            }else{
              echo json_encode([
                'status' => 1,
                'answer' => str_replace("(($function_name))", $function_name(), $answer)
              ]);
            }
            return;
          }
        }
      }else{
        echo json_encode([
          'status' => 0,
          'answer' => "Unfortunately, I cannot answer your question at the moment. I need to be trained further. The training data format is <br> <b>train: question # answer</b>"
        ]);
      }		
      return;
    }else{
      //in training mode
      //get the question and answer
      $question_and_answer_string = substr($question, 6);
      //remove excess white space in $question_and_answer_string
      $question_and_answer_string = preg_replace('([\s]+)', ' ', trim($question_and_answer_string));
      
      $question_and_answer_string = preg_replace("([?.])", "", $question_and_answer_string); //remove ? and . so that questions missing ? (and maybe .) can be recognized
      $split_string = explode("#", $question_and_answer_string);
      if(count($split_string) == 1){
        echo json_encode([
          'status' => 0,
          'answer' => "Invalid training format. I cannot decipher the answer part of the question \n
                      The correct format is training: question # answer # password"
        ]);
        return;
      }
      $que = trim($split_string[0]);
      $ans = trim($split_string[1]);
  
      if(count($split_string) < 3){
        echo json_encode([
          'status' => 0,
          'answer' => "You need to enter the training password to train me."
        ]);
        return;
      }
  
      $password = trim($split_string[2]);
      //verify if training password is correct
      define('TRAINING_PASSWORD', 'password');
      if($password !== TRAINING_PASSWORD){
        echo json_encode([
          'status' => 0,
          'answer' => "You are not authorized to train me"
        ]);
        return;
      }
  
      //insert into database
      $sql = "insert into chatbot (question, answer) values (:question, :answer)";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':question', $que);
      $stmt->bindParam(':answer', $ans);
      $stmt->execute();
      $stmt->setFetchMode(PDO::FETCH_ASSOC);
      echo json_encode([
        'status' => 1,
        'answer' => "Thanks alot for your help"
      ]);
      return;
    }
  
    echo json_encode([
      'status' => 0,
      'answer' => "Sorry, i really dont understand you right now, you could offer to train me"
    ]);  
  }catch (Exception $e){
    return $e->message ;
  }
  
} else {


/*if($_SERVER['REQUEST_METHOD'] === 'POST'){

    include "../answers.php";
    
    try{

	    if(!isset($_POST['question'])){
	      echo json_encode([
	        'status' => 1,
	        'result' => "Please provide a question"
	      ]);
	      return;
	    }

	    //if(!isset($_POST['question'])){
	    $mem = $_POST['question'];
	    $mem = preg_replace('([\s]+)', ' ', trim($mem));
	    $mem = preg_replace("([?.])", "", $mem);
		$arr = explode(" ", $mem);
		//test for training mode

		if($arr[0] == "train:"){



	        //echo json_encode([
	          //'status' => 0,
	          //'answer' => "You need to enter the training password to train me."
	        //]);
			unset($arr[0]);
			$q = implode(" ",$arr);
			$queries = explode("#", $q);
			if (count($queries) < 3) {
				# code...
				echo json_encode([
					'status' => 0,
					'result' => "You need to enter a password to train me."
				]);
				return;
			}
			$password = trim($queries[2]);
			//to verify training password
			define('trainingpassword', 'password');
			
			if ($password !== trainingpassword) {
				# code...
				echo json_encode([
					'status'=> 0,
					'result' => "You entered a wrong passsword"
				]);
				return;
			}
			$quest = $queries[0];
			$ans = $queries[1];
			$sql = "INSERT INTO chatbot(question, answer) VALUES ( '" . $quest . "', '" . $ans . "')";
			$conn->exec($sql);
			echo json_encode([
				'status' => 1,
				'result' => "Thanks for training me, you can now test my knowledge"
			]);
			return;
	    }
	    //else {
	   //   $arrayName = array('result' => 'Oh my Error');
	   //   header('Content-type: text/json');
	   //   echo json_encode($arrayName);
	   //   return;
	   // }
	    elseif ($arr[0] == "aboutbot") {
	    	# code...
	    	echo json_encode([
	    		'status'=> 1,
	    		'result' => "I am MATRIX, Version 1.0.0. You can train me by using this format ' train: This is a question # This is the answer # password '"
	    	]);
	    	return;
	    }
	    else {
	    	$question = implode(" ",$arr);
	    	//to check if answer already exists in the database...
	    	$question = "%$question%";
	    	$sql = "Select * from chatbot where question like $question";
	        $stat = $conn->prepare($sql);
	        $stat->bindParam(':question', $question);
	        $stat->execute();

	        $stat->setFetchMode(PDO::FETCH_ASSOC);
	        $rows = $stat->fetchAll();
	        if(count($rows)>0){
		        $index = rand(0, count($rows)-1);
		        $row = $rows[$index];
		        $answer = $row['answer'];
		        
		        echo json_encode([
		        	'status' => 1,
		        	'result' => $answer
		        ]);
		        return;
		    }else{

		    	echo json_encode([
		    		'status' => 0,
		    		'result' => "I am sorry, I cannot answer your question now. You could offer to train me."
		    	]);
		    	return;
		    }
	    }
	}catch (Exception $e){
		return $e->message ;
	}
}*/
?>
<!DOCTYPE html>
<html>
<head>
	<title>  <?php echo $user->name ?></title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="https://fonts.googleapis.com/css?family=Alfa+Slab+One|Ubuntu" rel="stylesheet">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
		<style type="text/css">
		body{
			background-image: url(https://res.cloudinary.com/adeyefa/image/upload/v1524267920/turntable-1109588__340.jpg);
			height: 100%; 
		    background-position: center;
		    background-repeat: no-repeat;
		    background-size: cover;
		}
		h1{
			text-align: center;
			color: red;
		}
		p{
			text-align: center;
			font-size: 60px;
			color: red;
		}
		#p1{
			text-align: center;
			font-size: 60px;
		}
		#info{
			text-align: center;
			font-size: 30px;
		}
		.sidebar{
			width: 400px;
			height: 590px;
		}
		.bbb{
			width: 790px;
			height: 590px;
			float: right;
		}
		.row{
			border-bottom: 3px solid #E1E1E1;
			margin-bottom: 10px;
			padding: 7px;
		}
		#form{
			background-color: rgb(52,185,96,0.9);
			color: #FFF;
			padding: 7px;
			position: absolute;
			width: 400px;
			height: auto;
		}
		input{
			width: 100%;
		    padding: 12px 20px;
		    margin: 8px 0;
		    box-sizing: border-box;
		}
		textarea{
		    width: 80%;
		    box-sizing: border-box;
		    border: 2px solid #ccc;
		    border-radius: 4px;
		    font-size: 15px;
		    padding: 12px 20px 12px 40px;
		}

		input[type=submit]{
		    width: 80%;
		    padding: 12px 20px;
		    margin: 8px 8px;
		}
		.head{
			text-align: center;
		}
		h2{
			color: white;
			font-weight: bolder;
			font-size: 40px;
		}
		li{
			size: 20px;
		}
		#questionBox{
			font-size: 15px;
			font-family: Ubuntu;
			width: 400px;
			height: auto;
		}
		#bot_reply{
            position: relative;
		    overflow: auto;
		    overflow-x: hidden;
		    padding: 10px 5px 92px;
		    border: none;
		    max-height: 300px;
		    -webkit-justify-content: flex-end;
		    justify-content: flex-end;
		    -webkit-flex-direction: column;
		    flex-direction: column;
		}
		.irr{
	        color: #fff;
	        font-size: 15px;
			font-family: Ubuntu;
		}
		.irr:before{
			left: -3px;
            background-color: #00b0ff;
		}
		#queries{
			margin-left: 50px;
		}
		.iro{
			float: right;
			color: #0DDFFF;
			font-size: 20px;
			font-family: Ubuntu;
		}
		.iio{
			float: left;
			margin-right: 90px;
			color: #01DDDD;
			font-size: 20px;
			font-family: Ubuntu;
		}
	</style>
</head>
<body>
	<div class="iii">
		<div class="bbb">
	    	<div class="main">
				<p>
					HELLO WORLD
				</p>
				<p id="p1">
					I am  <?php echo $fullName ; ?>
				</p>
				<p id="info">
					A Web developer, blogger and Software engineer
				</p>
				<p id="fav">
					<a href="https://github.com/sainttobs"><i class="fa fa-github"></i></i></a>
					<a href="https://twitter.com/9jatechguru"><i class="fa fa-twitter"></i></i></a>
					<a href="https://web.facebook.com/toba.adeyefa"><i class="fa fa-facebook"></i></i></a>	
				</p>
			</div>
	    </div>	
		<div class="sidebar">
			<div class="head">
				<h2> Chat With MyBot</h2>
			</div>
			<div class="row-holder">
				<div class="row2">
					<div id="form">
						<form id="qform" method="post">
							<div id="textform">
								<textarea id='questionBox' name="question" placeholder="Enter message ..."></textarea>
								<button type="submit" id="send-button">Send</button>
							</div>
							<div id="bot_reply">
								<div class="irr">
									Hi,i am MATRIX, the bot, i can answer basic questions. To know more about me type: 'aboutbot'
								</div>
								<div class="iro">
									<ul id="queries">
										
									</ul>
								</div>	
								<div class="iio">
									<ul id="ans">
											
									</ul>
								</div>	
							</div>
						</form>
					</div>
				</div>
			</div>		
	    </div>
	</div>	
	<script src="../vendor/jquery/jquery.min.js"></script>
	<script>
		$(document).ready(function(){
			var Form =$('#qform');
			Form.submit(function(e){
				e.preventDefault();
				var questionBox = $('textarea[name=question]');
				var question = questionBox.val();
				$("#queries").append("<li>" + question + "</li>");
					//let newMessage = `<div class="iro">
	                  //${question}
	                //</div>`
				$.ajax({
					url: '../profiles/Adeyefa.php',
					type: 'POST',
					data: {question: question},
					dataType: 'json',
					success: function(response){
			        //$("#ans").append("<li>"  + response.result +  "</li>");
			        console.log(response.answer);
			        //alert(response.result.d);
			        //alert(answer.result);
			        
					},
					error: function(error){
						//console.log(error);
				        alert(JSON.stringify(error));
					}
				})	
			})
		});
	</script>
</body>
</html> 

<?php

?>
