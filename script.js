// JavaScript Document
var url_master = 'http://www.aloocopete.cl/comandas/';	
//var url_master = 'http://localhost/alocopete/comandas/';
var watchID = null;
var map;
var marker;
var mapa_existe = false;
var draw_circle;
var pedido_producto = [];
var pedido_cantidad = [];
var precio_despacho = 0;
var productos_nombre = {};
var productos_stock = {};
var productos_precio = {};
var producto_temp_id = 0;
var producto_temp_n = 0;

var maestro_categorias = [];
var maestro_productos_categorias = [];


// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);


$.ajax({
	url: 'db.js',
	dataType: "script"
});

// Cordova is ready
//
function onDeviceReady() {
		//navigator.notification.alert('Cordova is ready');
}

function alertDismissed() {
    // hacer algo
}
function ErrorUbicacion(error) {
	var texto = 'No se ha podido obtener la ubicación.';
	msg(texto);
}
function getCurrentPosition() {
	navigator.geolocation.getCurrentPosition(onSuccess, ErrorUbicacion);    
}
function watchPosition() {
	var options = { frequency: 1000 };
	watchID = navigator.geolocation.watchPosition(posicion_ok, ErrorUbicacion, options);
}
function inicia_posicion(){
	// Cambia de página
	$.mobile.changePage("#pagina02");
	$.mobile.loading( 'show', {
		text: 'Localizando',
		textVisible: true,
		theme: 'a',
		html: ""
	});
	// Inicia el mapa en la plaza de armas
	if(map == null){
		initialize(-33.437782,-70.64981);
	}
	// Encuentra la ubicación actual
	watchPosition();
}
function posicion_ok(position){
	document.getElementById('lat').value = position.coords.latitude;
	document.getElementById('lon').value = position.coords.longitude;
	// Vuelve a centrar el mapa
	var centro = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	map.setCenter(centro);
	marker.setPosition(centro);
	// Dibuja un circulo con el radio 0
	draw_circle.setMap(null);
	var rad = position.coords.accuracy;
	draw_circle = new google.maps.Circle({
			center: centro,
			radius: rad,
			strokeColor: "#9999FF",
			strokeOpacity: 0.8,
			strokeWeight: 1,
			fillColor: "#BFDFFF",
			fillOpacity: 0.35,
			map: map
	});
	// Acerca al circulo
	map.fitBounds(draw_circle.getBounds());
	zoom = map.getZoom();
	if(zoom>17){// Si el zoom es mucho, lo deja en 17
		map.setZoom(17);
	}
	$.mobile.hidePageLoadingMsg();
}
function onSuccess(position) {
	document.getElementById('lat').value = position.coords.latitude;
	document.getElementById('lon').value = position.coords.longitude;
}
function initialize(lat,lon) {
  var myLatlng = new google.maps.LatLng(lat,lon);
  var mapOptions = {
    zoom: 15,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Tu Ubicación'
  });
	var rad = 0;
	draw_circle = new google.maps.Circle({
			center: myLatlng,
			radius: rad,
			strokeColor: "#9999FF",
			strokeOpacity: 0.8,
			strokeWeight: 1,
			fillColor: "#BFDFFF",
			fillOpacity: 0.35,
			map: map
	});
}
function msg(texto){
	if(typeof(navigator.notification)=='undefined'){
		alert(texto);
	}else{
		navigator.notification.alert(
				texto,  				// message
				alertDismissed, // callback
				'Aloo Copete',  // title
				'Listo!'        // buttonName
		);
	}
}
function mostrar(){
	var lat = document.getElementById('lat').value;
	var lon = document.getElementById('lon').value;
	var location = ( '(' + lat + ',' + lon + ')');
	url = url_master + "poly_punto.php?buscar_sector="+location+'&app';
	
	$.ajax({
		url: url,
		beforeSend: function() { $.mobile.showPageLoadingMsg(); }, //Show spinner
		complete: function() { $.mobile.hidePageLoadingMsg(); }, //Hide spinner
		dataType: "jsonp",
		async: true,
		success: function (result) {
			var nombre = result['nombre'];
			precio_despacho = result['precio1'];
			var texto = 'Sector: ' + nombre;
			//msg(texto);
			$.mobile.changePage("#pagina03");
			$("#valor_despacho").html(FormatoDinero(precio_despacho));
		},
		error: function (request,error) {
			var texto = 'Error conectando con el servidor!';
			msg(texto);
		}
	});
}
function paso_datos(){
	var error_txt = "Faltan Datos: ";
	var matriz = [];
	var error = false;
	if(document.getElementById('cliente_nombre').value==''){
		matriz.push("Nombre");
		error = true;
	}
	if(document.getElementById('cliente_telefono').value==''){
		matriz.push("Teléfono");
		error = true;
	}
	if(error){
		msg(error_txt + matriz.join(", "));
	}else{
		$.mobile.changePage("#pagina04");
	}
}
function paso_direccion(){
	var error_txt = "Faltan Datos: ";
	var matriz = [];
	var error = false;
	if(document.getElementById('direccion_calle').value==''){
		matriz.push("Calle");
		error = true;
	}
	if(document.getElementById('direccion_numero').value==''){
		matriz.push("Número");
		error = true;
	}
	if(document.getElementById('direccion_comuna').value==''){
		matriz.push("Comuna");
		error = true;
	}
	if(error){
		msg(error_txt + matriz.join(", "));
	}else{
		$.mobile.changePage("#pagina05");
	}
}
function eliminar_producto(id){
	$("#producto_linea"+id).empty();
	pedido_producto[id] = 0;
	pedido_cantidad[id] = 0;
	suma_total();
}
function suma_total(){
	var valor = 0;
	valor = valor*1 + precio_despacho*1;
	$.each(pedido_producto, function(index, value) {
		if(value > 0){
			valor = valor + productos_precio[value] * pedido_cantidad[index];
		}
	});
	$("#valor_total").html(FormatoDinero(valor));
}
function nuevo_producto(producto_temp_id,producto_temp_n){
	if(producto_temp_n>0){
		// agrega nuevo producto.
		//producto_temp_id = document.getElementById('producto_nuevo_id').value;
		//producto_temp_n = document.getElementById('producto_nuevo_n').value;
		
		var id = pedido_producto.length;
			
		pedido_producto[id] = producto_temp_id;
		pedido_cantidad[id] = producto_temp_n;
		
		$('.ui-dialog').dialog('close');
		texto = '<div id="producto_linea'+id+'">';
		//texto = texto + '<input name="productos_matriz[]" id="productos_matriz[]" type="hidden" value="'+producto_temp_id+'">';
		//texto = texto + '<input name="productos_matriz_n[]" id="productos_matriz_n[]" type="hidden" value="'+producto_temp_n+'">';
		texto = texto + '<div class="ui-grid-b">';
		texto = texto + '<div class="ui-block-a" style="text-align:left; width:50%;">';
		texto = texto + productos_nombre[producto_temp_id];
		texto = texto + ' - <a href="#" onClick="eliminar_producto('+id+')">Eliminar</a>';
		texto = texto + '</div>';
		texto = texto + '<div class="ui-block-b" style="text-align:center; width:20%;">';
		texto = texto + producto_temp_n;
		texto = texto + '</div>';
		texto = texto + '<div class="ui-block-c" style="text-align:right; width:30%;">';
		texto = texto + FormatoDinero(productos_precio[producto_temp_id]*producto_temp_n);
		texto = texto + '</div>';
		texto = texto + '</div>';
		//texto = texto + '<p>'+productos_lista[producto_temp_id]['nombre']+' (' + document.getElementById('producto_nuevo_n').value + ')</p>';
		texto = texto + '<hr>';
		texto = texto + '</div>';
		suma_total();
		$('#lista_productos').append(texto);
	}else{
		var text = 'Cantidad incorrecta.';
		msg(text);
	}
}

$("#pagina05").live('pagebeforeshow', function() {
	// Cuando aparece la pantalla de producto
	url = url_master + "productos.json.php";
	$.ajax({
		url: url,
		beforeSend: function() { $.mobile.showPageLoadingMsg(); }, //Show spinner
		complete: function() { $.mobile.hidePageLoadingMsg(); }, //Hide spinner
		dataType: "jsonp",
		async: true,
		success: function (result) {
			// Cargando al select
			productos_nombre = {};
			productos_stock = {};
			productos_precio = {};
			$.each(result, function(key, value) {
				//var tex = '<option value="'+result[key]['id_producto']+'">'+result[key]['nombre_categoria']+': '+result[key]['nombre']+'</option>';
				//$('#producto_nuevo_id').append(tex);
				productos_nombre[result[key]['id_producto']] = result[key]['nombre'];
				productos_stock[result[key]['id_producto']] = result[key]['stock'];
				productos_precio[result[key]['id_producto']] = result[key]['precio'];
				maestro_categorias[result[key]['id_categoria']] = result[key]['nombre_categoria'];
				if (typeof(maestro_productos_categorias[result[key]['id_categoria']]) == 'undefined') {
					maestro_productos_categorias[result[key]['id_categoria']] = [];
				}
				maestro_productos_categorias[result[key]['id_categoria']][result[key]['id_producto']] = result[key]['id_producto'];
			});
		},
		error: function (request,error) {
			$.mobile.changePage("#pagina04");
			var texto = 'Error conectando con el servidor!';
			msg(texto);
		}
	});
});
$("#nuevo_producto").live('pagebeforeshow', function() {
	// Cuando aparece la pantalla de agregar nuevo producto al pedido
	//$('#producto_nuevo_id').prop('selectedIndex',2);
	//document.getElementById('producto_nuevo_n').value = '';
	cargar_lista_categorias();
});
function FormatoDinero(x) {
    return '$' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function ultimo_paso(){
	$.mobile.changePage("#pagina06");
	$("#nombre_conf").html(document.getElementById('cliente_nombre').value);
	$("#telefono_conf").html(document.getElementById('cliente_telefono').value);
	$("#direccion_conf").html(document.getElementById('direccion_calle').value+' '+document.getElementById('direccion_numero').value+', '+document.getElementById('direccion_otro').value);
	$("#comuna_conf").html(document.getElementById('direccion_comuna').value);
	
	
	// Parte productos
	
		var valor = 0;
	valor = valor*1 + precio_despacho*1;
	$.each(pedido_producto, function(index, value) {
		if(value > 0){
			valor = valor + productos_precio[value] * pedido_cantidad[index];
			texto = '<div id="producto_linea_conf'+value+'">';
							texto = texto + '<div class="ui-grid-b">';
												texto = texto + '<div class="ui-block-a" style="text-align:left; width:50%;">';
												texto = texto + productos_nombre[value];
												texto = texto + '</div>';
												texto = texto + '<div class="ui-block-b" style="text-align:center; width:20%;">';
												texto = texto + pedido_cantidad[index];
												texto = texto + '</div>';
												texto = texto + '<div class="ui-block-c" style="text-align:right; width:30%;">';
												texto = texto + FormatoDinero(productos_precio[value] * pedido_cantidad[index]);
												texto = texto + '</div>';
							texto = texto + '</div>';
							//texto = texto + '<p>'+productos_lista[producto_temp_id]['nombre']+' (' + document.getElementById('producto_nuevo_n').value + ')</p>';
							texto = texto + '<hr>';
			texto = texto + '</div>';
			suma_total();
			$('#lista_productos_conf').append(texto);
		}
	});
	$("#valor_despacho_conf").html(FormatoDinero(precio_despacho));
	$("#valor_total_conf").html(FormatoDinero(valor));

}

function confirmar(){
	//Valida que existan productos:
	var valor = 0;
	$.each(pedido_producto, function(index, value) {
		valor = valor + value;
	});
	
	if(valor>0){// Si hay productos
		// Pregunta
		if(typeof(navigator.notification)=='undefined'){
			var buttonIndex;
			confirma_si(buttonIndex);
		}else{
			navigator.notification.confirm(
					'Está a punto de hacer el pedido. \n ¿Está todo OK? ',  // message
					onConfirm,              // callback to invoke with index of button pressed
					'Confirmar Pedido',            // title
					'Cancelar,OK'          // buttonLabels
			);
		}
	}else{//no hay productos
		msg('Debe agregar productos.');
	}
}
function onConfirm(buttonIndex) {
    if(buttonIndex==2){
			// OK
			confirma_si();
		}else{
			// Cancelar
		}
}
function confirma_si(){
	// envia información
	url = url_master + "pedido.json.php?";
	//url = "http://www.exefire.com/log/?";
	url = url + 'lat=' + document.getElementById('lat').value + '&';
	url = url + 'lon=' + document.getElementById('lon').value + '&';
	url = url + 'cliente_nombre=' + document.getElementById('cliente_nombre').value + '&';
	url = url + 'cliente_telefono=' + document.getElementById('cliente_telefono').value + '&';
	url = url + 'direccion=' + document.getElementById('direccion_calle').value + '&';
	url = url + 'numero=' + document.getElementById('direccion_numero').value + '&';
	url = url + 'otro=' + document.getElementById('direccion_otro').value + '&';
	url = url + 'comuna=' + document.getElementById('direccion_comuna').value + '&';
	if(typeof(navigator.notification)=='undefined'){
	}else{
		url = url + 'device.name=' + device.name + '&';
		url = url + 'device.platform=' + device.platform + '&';
		url = url + 'device.uuid=' + device.uuid + '&';
		url = url + 'device.version=' + device.version + '&';
	}
	var valor = 0;
	valor = valor*1 + precio_despacho*1;
	$.each(pedido_producto, function(index, value) {
		if(value > 0){
			url = url + 'productos_id[]=' + value + '&';
			url = url + 'productos_n[]=' + pedido_cantidad[index] + '&';
		}
	});
	
	
	$.ajax({
		url: url,
		beforeSend: function() { $.mobile.showPageLoadingMsg(); }, //Show spinner
		complete: function() { $.mobile.hidePageLoadingMsg(); }, //Hide spinner
		dataType: "jsonp",
		async: true,
		success: function (result) {
			// Cargando al select
			var respuesta = "";
			$.each(result, function(index, value) {
				if(index=='respuesta'){
					respuesta = respuesta + value;
				}
			});
			$("#respuesta_final").html(respuesta);
			// muestra siguiente pagina
			$.mobile.changePage("#pagina07");
			cancelar_pedido();
		},
		error: function (request,error) {
			$.mobile.changePage("#pagina06");
			var texto = 'Error conectando con el servidor!';
			msg(texto);
		}
	});
}
function boton_cancelar_pedido(){
	if(typeof(navigator.notification)=='undefined'){
		var buttonIndex = 2;
		cancelar_pedido_salto(buttonIndex);
	}else{
		navigator.notification.confirm(
				'¿Seguro que quiere cancelar el pedido? ',  // message
				cancelar_pedido_salto,              // callback to invoke with index of button pressed
				'Cancelar Pedido',            // title
				'No,Si'          // buttonLabels
		);
	}
}
function cancelar_pedido_salto(buttonIndex){
	if(buttonIndex==2){
		// Si
		cancelar_pedido();
		$.mobile.changePage("#pagina01");
	}else{
		// No
	}
}
function cancelar_pedido(){
	// También se usa cuando se finaliza el pedido.
	
	// Mapa
	
	// Lista de productos
	$("#valor_despacho").html('');
	$("#valor_total").html('');
	$("#nombre_conf").html('');
	$("#telefono_conf").html('');
	$("#direccion_conf").html('');
	$("#comuna_conf").html('');
	$("#valor_despacho_conf").html('');
	$("#valor_total_conf").html('');
	
	$("#lista_productos").html('');
	//$("#producto_nuevo_id").html('');
	$("#lista_productos_conf").html('');
		
	pedido_producto = [];
	pedido_cantidad = [];
	precio_despacho = 0;
	productos_nombre = {};
	productos_precio = {};
	producto_temp_id = 0;
	producto_temp_n = 0;
}
function cargar_lista_categorias(){
	$("#lista_cat").html('');
	$.each(maestro_categorias, function(key, value) {
		if(key>0){
			$('#lista_cat').append('<li><a href="#" onClick="actualiza_lista('+key+')">'+value+'</a></li>');
		}
	});
	var contenido = ('<li><div class="ui-grid-a"> <div class="ui-block-a"> <input type="button" onClick="$(\'.ui-dialog\').dialog(\'close\')" value="Cancelar" data-theme="a" data-rel="back"> </div> <div class="ui-block-b" id="boton_agregar_producto"> &nbsp;</div></div></li>');
	$('#lista_cat').append(contenido).trigger('create');
	$("#lista_cat").listview('refresh');
}
function actualiza_lista(id_cat){
	$("#lista_cat").html('');
	$.each(maestro_productos_categorias[id_cat], function(key, value) {
		if(value>0){
			if(productos_stock[value]>0){
				$('#lista_cat').append('<li><a href="#" style="white-space:normal;" onClick="solo_producto('+key+')">'+productos_nombre[value]+'<span class="ui-li-count ui-btn-up-c ui-btn-corner-all">' + (FormatoDinero(productos_precio[value])) + '</span></a></li>');
			}else{
				$('#lista_cat').append('<li>'+productos_nombre[value] + ' <br><span style="color:#F00;">Sin Stock</span>' + '<span class="ui-li-count ui-btn-up-c ui-btn-corner-all">' + (FormatoDinero(productos_precio[value])) + '</span></li>');
			}
		}
	});
	
	var contenido = ('<li><div class="ui-grid-a"> <div class="ui-block-a"> <input type="button" onClick="$(\'.ui-dialog\').dialog(\'close\')" value="Cancelar" data-theme="a" data-rel="back"> </div> <div class="ui-block-b" id="boton_agregar_producto"> &nbsp;</div></div></li>');
	$('#lista_cat').append(contenido).trigger('create');
	$("#lista_cat").listview('refresh');
}
function solo_producto(id_prod){
	var boton_aceptar =  '<input type="button" onClick="nuevo_producto('+id_prod+',document.getElementById(\'producto_nuevo_n\').value)" value="Agregar" data-theme="b">';
	var boton_cancelar = '<input type="button" onClick="$(\'.ui-dialog\').dialog(\'close\')" value="Cancelar" data-theme="a" data-rel="back">';
	var cantidad_in = '<input type="number" name="producto_nuevo_n" id="producto_nuevo_n" pattern="[0-9]*" value="" style="width:"80%;" />';
	$("#lista_cat").html('');
	var contenido = '';
	contenido = contenido + ('<li><div class="ui-grid-a"><div class="ui-block-a">Producto</div><div class="ui-block-b">Cantidad</div></div></li>');
	contenido = contenido + ('<li><div class="ui-grid-a"><div class="ui-block-a">'+productos_nombre[id_prod]+'</div><div class="ui-block-b">'+cantidad_in+'</div></div></li>');
	contenido = contenido + ('<li><div class="ui-grid-a"><div class="ui-block-a">'+boton_cancelar+'</div><div class="ui-block-b">'+boton_aceptar+'</div></div></li>');
	$('#lista_cat').append(contenido).trigger('create');
	$("#lista_cat").listview('refresh');
}