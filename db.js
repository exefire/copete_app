// JavaScript Document
// Wait for device API libraries to load
document.addEventListener("deviceready", onDeviceReady, false);

function numero(num){
	if(num<10){
		num = '0' + num;
	}
	return num;
}

function ahora_txt(){
	var currentdate = new Date(); 
	var hora = 	"" 
							+ currentdate.getFullYear() + "-"  
							+ numero(currentdate.getMonth()+1)  + "-" 
							+	numero(currentdate.getDate()) + " "
							+ numero(currentdate.getHours()) + ":"  
							+ numero(currentdate.getMinutes()) + ":" 
							+ numero(currentdate.getSeconds());
	return hora;
}

// Populate the database
function populateDB(tx) {
	//tx.executeSql('DROP TABLE IF EXISTS DEMO');
	tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, data)');
	queryDB2(tx);
}

function queryDB2(tx) {
	tx.executeSql('SELECT max(id) as id FROM DEMO',[],querySuccess2);
}

function querySuccess2(tx, results) {
	var siguiente = results.rows.item(0).id + 1;
	tx.executeSql('INSERT INTO DEMO (id, data) VALUES ('+siguiente+', "'+ahora_txt()+'")');
}

// Query the database
function queryDB(tx) {
		tx.executeSql('SELECT * FROM DEMO ORDER BY id DESC LIMIT 5', [], querySuccess, errorCB);
}

// Query the success callback
function querySuccess(tx, results) {
		var len = results.rows.length;
		//console.log("DEMO table: " + len + " rows found.");
		$('#contenido').html('');
		for (var i=0; i<len; i++){
				var txt = "Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).data;
				txt = '<b>'+results.rows.item(i).id+'.</b> ' + results.rows.item(i).data;
				//console.log(txt);
				$('#contenido').append(txt);
				$('#contenido').append('<br>');
		}
}

// Transaction error callback
function errorCB(err) {
		console.log("Error processing SQL: "+err.message);
}

// Transaction success callback
function successCB() {
		var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
		db.transaction(queryDB, errorCB);
}

function cargar(){
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	db.transaction(populateDB, errorCB, successCB);
}

// device APIs are available
function onDeviceReady() {
		cargar();
}
		
function UrlExists(url){
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return http.status!=404;
}

if(!UrlExists('cordova.js')){
	cargar();
}

function vaciar(){
	var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	db.transaction(function (tx) { 
		tx.executeSql('DELETE FROM DEMO', [], vaciar_exito, vaciar_error); 
	});
}

function vaciar_exito(){
	$('#contenido').html('');
}

function vaciar_error(tx, error){ // Function for Hendeling Error...
	console.log(error.message);
}