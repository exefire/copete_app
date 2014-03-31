// JavaScript Document

// Populate the database
function populateDB(tx) {
	//tx.executeSql('DROP TABLE IF EXISTS DATOS');
	tx.executeSql('CREATE TABLE IF NOT EXISTS DATOS (id unique, campo, valor)');
	queryDB2(tx);
}

function queryDB2(tx) {
	tx.executeSql('SELECT max(id) as id FROM DATOS',[],querySuccess2);
}

function querySuccess2(tx, results) {
	var ultimo = results.rows.item(0).id;
	if(ultimo<1){
		tx.executeSql('INSERT INTO DATOS (id, campo, valor) VALUES (1, "cliente_nombre", "")');
		tx.executeSql('INSERT INTO DATOS (id, campo, valor) VALUES (2, "cliente_telefono", "")');
		tx.executeSql('INSERT INTO DATOS (id, campo, valor) VALUES (3, "direccion_calle", "")');
		tx.executeSql('INSERT INTO DATOS (id, campo, valor) VALUES (4, "direccion_numero", "")');
		tx.executeSql('INSERT INTO DATOS (id, campo, valor) VALUES (5, "direccion_otro", "")');
		tx.executeSql('INSERT INTO DATOS (id, campo, valor) VALUES (6, "direccion_comuna", "")');
	}
	/*
	1	cliente_nombre
	2	cliente_telefono
	3	direccion_calle
	4	direccion_numero
	5	direccion_otro
	6	direccion_comuna
	*/ 
}

// Query the database
function queryDB(tx) {
		tx.executeSql('SELECT * FROM DATOS ORDER BY id ASC', [], querySuccess, errorCB);
}

// Query the success callback
function querySuccess(tx, results) {
		$('#contenido').html('');
		var len = results.rows.length;
		for (var i=0; i<len; i++){
				var txt = '<b>'+results.rows.item(i).campo+':</b> ' + results.rows.item(i).valor;
				//console.log(txt);
				$('#contenido').append(txt);
				$('#contenido').append('<br>');
		}
}

// Transaction error callback
function errorCB(err) {
		console.log("Error SQL: "+err.message);
}

// Transaction success callback
function successCB() {
		var db = window.openDatabase("Database", "1.0", "Cordova DATOS", 200000);
		db.transaction(queryDB, errorCB);
}

function cargar(){
	var db = window.openDatabase("Database", "1.0", "Cordova DATOS", 200000);
	db.transaction(populateDB, errorCB, successCB);
}
		
function UrlExists(url){
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return http.status!=404;
}

cargar();

//
// Función para Escribir datos guardados en los campos respectivos.
//
function escribe_datos_guardados(){
	var db = window.openDatabase("Database", "1.0", "Cordova DATOS", 200000);
	db.transaction(function (tx) { 
		tx.executeSql('SELECT * FROM DATOS', [], datos_exito, datos_error); 
	});
}
function datos_exito(tx, results) {
	var len = results.rows.length;
	for (var i=0; i<len; i++){
		$('#' + results.rows.item(i).campo).val(results.rows.item(i).valor);
		//console.log(results.rows.item(i).campo + ': ' + results.rows.item(i).valor);
	}
}
function datos_error(err) {
	console.log("Error SQL: "+err.message);
}



//
// Función para actualizar campos en la base de datos
//
function actualiza_datos(campo,valor){
	var db = window.openDatabase("Database", "1.0", "Cordova DATOS", 200000);
	db.transaction(function (tx) { 
		var sql = 'UPDATE DATOS SET valor = "'+valor+'" WHERE campo = "'+campo+'"';
		tx.executeSql(sql, [], actualiza_exito, actualiza_error); 
		//console.log(sql);
	});
}
function actualiza_exito(tx, results) {
	console.log('Dato actualizado.');
}
function actualiza_error(err) {
	console.log("Error SQL: "+err.message);
}