var tablaR;

// DATA DE RESERVACION
function getDataR() {
	tablaR = $('#Reservacion').DataTable({
		responsive: true,
		autoWidth: false,
		destroy: true,
		deferRender: true,
		"language": {
			"sProcessing": "Procesando...",
			"sLengthMenu": "Mostrar _MENU_ registros",
			"sZeroRecords": "No se encontraron resultados",
			"sEmptyTable": "Ningún dato disponible en esta tabla",
			"sInfo": "Mostrando del _START_ al _END_ de un total de _TOTAL_ registros",
			"sInfoEmpty": "Mostrand del 0 al 0 de un total de 0 registros",
			"sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
			"sInfoPostFix": "",
			"sSearch": "Buscar:",
			"sUrl": "",
			"sInfoThousands": ",",
			"sLoadingRecords": "Cargando...",
			"oPaginate": {
				"sFirst": "<span class='fa fa-angle-double-left'></span>",
				"sLast": "<span class='fa fa-angle-double-right'></span>",
				"sNext": "<span class='fa fa-angle-right'></span>",
				"sPrevious": "<span class='fa fa-angle-left'></span>"
			},
			"oAria": {
				"sSortAscending": ": Activar para ordenar la columna de manera ascendente",
				"sSortDescending": ": Activar para ordenar la columna de manera descendente"
			}
		},
		ajax: {
			url: window.location.pathname,
			type: 'POST',
			data: {
				'action': 'listado_reservacion'
			},
			dataSrc: ""
		},
		columns: [{
			"data": "id"
		}, {
			"data": "fechaReserva"
		},{
			"data": "estado"
		},{
			"data": "cliente.ci"
		}, {
			"data": "origen"
		}, {
			"data": "origen"
		}],
		columnDefs: [{
			targets: [-1],
			class: 'text-center',
			orderable: false,
			render: function(data, type, row) {

				var buttons = '<a href="#" rel="detail" class="btn btn-icon btn-dark" data-toggle="tooltip" data-placement="top" title="Detalles de reservación"><i class="fas fa-info"></i></a> ';
				if (row['estado'] == 'Pendiente'){
					buttons += ' <a href="#" rel="activar" class="btn btn-icon btn-success opt"><i class="fas fa-thumbs-up" data-toggle="tooltip" data-placement="top" title="Aprobar reservación"></i></a>';
					buttons += ' <a href="#" rel="desactivar" class="btn btn-icon btn-danger opt"><i class="fas fa-thumbs-down" data-toggle="tooltip" data-placement="top" title="Rechazar reservación"></i></a>';
					buttons += ' <a href="#" rel="pagar" class="btn btn-icon btn-info opt2"><i class="fas fa-hand-holding-usd" data-toggle="tooltip" data-placement="top" title="Pagar reservación"></i></a>';
				}
				if(row['estado'] == 'Aprobada'){
					buttons += ' <a href="#" rel="finalizar" class="btn btn-icon btn-info opt" data-toggle="tooltip" data-placement="top" title="Finalizar reservación"><i class="fas fa-calendar-check"></i></a>';
					buttons += ' <a href="#" rel="cambiar_status" class="btn btn-icon btn-warning opt" data-toggle="tooltip" data-placement="top" title="Ocupar Habitación"><i class="fas fa-exchange-alt"></i></a>';
				}
				return buttons;
			}

		},{
			targets: [-4],
			class: '',
			orderable: true,
			render: function(data, type, row) {

				if (data == 'Aprobada') {
					data = '<span class="badge bg-success">'+ data +'</span>';
				}else if (data == 'Finalizada'){
					data = '<span class="badge bg-dark">'+ data +'</span>';
				}else if (data == 'Rechazada'){
					data = '<span class="badge bg-danger">'+ data +'</span>';
				}
				else if (data == 'Pendiente'){
					data = '<span class="badge bg-warning">'+ data +'</span>';
				}
				
				return data;
			}

		}],
		initComplete: function(settings, json) {

		}
	});
};
$(function() {
	getDataR();
});

// REGISTRAR RESERVACION
/* FORM SUBMIT AJAX*/
$('#form_reservacion').on('submit', function(e) {
	e.preventDefault();
	if ($('input[name="daterangepicker"]').val() === null || $('input[name="daterangepicker"]').val() === ''  ) {
		toastr.warning('Debe introducir las fechas de la reservación', 'Operación fallida');
	}else{
		var parameters = new FormData(this);
		submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de realizar esta accion?', parameters, function() {
			if ($('input[name="rol"]').val() === 'True') {
				window.location.replace('/reservaciones/');
			}else{
				window.location.replace('/mis-reservaciones/');
			}
			
			toastr.success('Se ha registrado correctamente', 'Operación exitosa');
			$("#form_reservacion")[0].reset();
		});
	}
});

$('#form_pago').on('submit', function(e) {
	e.preventDefault();
	var parameters = new FormData(this);
	submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de realizar esta accion?', parameters, function() {
		window.location.replace('/mis-reservaciones/');
		toastr.success('Se ha pagado correctamente', 'Operación exitosa');
		$("#form_pago")[0].reset();
	});
});

$(function() {

	$("#Reservacion tbody").on('click', 'a[rel="pagar"]', function() {
		var tr = tablaR.cell($(this).closest('td, li')).index();
		var data = tablaR.row(tr.row).data();

		$('input[name="id"]').val(data.id);
		$('input[name="origen"]').val(data.origen);
		$("#modal_pago").modal('show');

	});

	$('#Reservacion tbody').on('click', 'a[rel="activar"]', function () {

		var tr = tablaR.cell($(this).closest('td, li')).index();
		var data_status = tablaR.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'aceptar_reserva');
		parameters.append('id', data_status.id);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de aprobar la reservacion?', parameters, function () {
			toastr.success('Se ha aprobado correctamente', 'Operación exitosa');
			getDataR();
		});  

	});

	$('#Reservacion tbody').on('click', 'a[rel="desactivar"]', function () {

		var tr = tablaR.cell($(this).closest('td, li')).index();
		var data_status = tablaR.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'rechazar_reserva');
		parameters.append('id', data_status.id);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de rechazar la reservacion?', parameters, function () {
			toastr.warning('Se ha rechazado correctamente', 'Operación exitosa');
			getDataR();
		});  

	});

	// Finalizar reservacion
	$('#Reservacion tbody').on('click', 'a[rel="finalizar"]', function () {

		var tr = tablaR.cell($(this).closest('td, li')).index();
		var data_status = tablaR.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'finalizar_reserva');
		parameters.append('id', data_status.id);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de finalizar la reservacion?', parameters, function () {
			toastr.warning('Se ha finalizado correctamente', 'Operación exitosa');
			getDataR();
		});  

	});

	// Cambiar estado a la habitacion a ocupada
	$('#Reservacion tbody').on('click', 'a[rel="cambiar_status"]', function () {

		var tr = tablaR.cell($(this).closest('td, li')).index();
		var data_status = tablaR.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'cambiar_estado_habitacion');
		parameters.append('id', data_status.id);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de cambiar el estado a la habitación?', parameters, function () {
			toastr.warning('Se ha cambiado correctamente', 'Operación exitosa');
			getDataR();
		});  

	});

	// DETALLE RESERVACION
	$('#Reservacion tbody').on('click', 'a[rel="detail"]', function () {

		var tr = tablaR.cell($(this).closest('td, li')).index();
		var data = tablaR.row(tr.row).data();

		$('#detalle_reservacion').DataTable({
			responsive: true,
            autoWidth: false,
            destroy: true,
            info: false,
            searching: false,
            paging: false, 
            deferRender: true,
			"language": {
				"sProcessing": "Procesando...",
				"sLengthMenu": "Mostrar _MENU_ registros",
				"sZeroRecords": "No se encontraron resultados",
				"sEmptyTable": "Ningún dato disponible en esta tabla",
				"sInfo": "Mostrando del _START_ al _END_ de un total de _TOTAL_ registros",
				"sInfoEmpty": "Mostrand del 0 al 0 de un total de 0 registros",
				"sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
				"sInfoPostFix": "",
				"sSearch": "Buscar:",
				"sUrl": "",
				"sInfoThousands": ",",
				"sLoadingRecords": "Cargando...",
				"oPaginate": {
					"sFirst": "<span class='fa fa-angle-double-left'></span>",
					"sLast": "<span class='fa fa-angle-double-right'></span>",
					"sNext": "<span class='fa fa-angle-right'></span>",
					"sPrevious": "<span class='fa fa-angle-left'></span>"
				},
				"oAria": {
					"sSortAscending": ": Activar para ordenar la columna de manera ascendente",
					"sSortDescending": ": Activar para ordenar la columna de manera descendente"
				}
			},
			ajax: {
				url: window.location.pathname,
				type: 'POST',
				data: {
					'action': 'detail_reservacion',
					'id': data.id,
				},
				dataSrc: ""
			},
			columns: [
				{"data": "id"},
				{"data": "fechaLlegada"},
				{"data": "fechaSalida"},
				{"data": "habitacion.numero"},
				{"data": "cantidad"},
				{"data": "total_bs"},
			],
			columnDefs: [{
				targets: [-1],
				class: 'text-center',
				orderable: false,
				render: function(data, type, row) {
					return parseFloat(data).toFixed(2) + ' Bs.S';
				}

			},{
				targets: [-2],
				class: 'text-center',
				orderable: false,
				render: function(data, type, row) {
					return parseFloat(data).toFixed(2) + ' $';
				}

			}
			],
			initComplete: function (settings, json) {
					
			}
		});
		// detalles de la compra
		$('#detalle_compras').DataTable({
			responsive: true,
            autoWidth: false,
			ordering:false,
            destroy: true,
            info: false,
            searching: false,
            paging: false, 
            deferRender: true,
			"language": {
				"sProcessing": "Procesando...",
				"sLengthMenu": "Mostrar _MENU_ registros",
				"sZeroRecords": "No se encontraron resultados",
				"sEmptyTable": "Ningún dato disponible en esta tabla",
				"sInfo": "Mostrando del _START_ al _END_ de un total de _TOTAL_ registros",
				"sInfoEmpty": "Mostrand del 0 al 0 de un total de 0 registros",
				"sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
				"sInfoPostFix": "",
				"sSearch": "Buscar:",
				"sUrl": "",
				"sInfoThousands": ",",
				"sLoadingRecords": "Cargando...",
				"oPaginate": {
					"sFirst": "<span class='fa fa-angle-double-left'></span>",
					"sLast": "<span class='fa fa-angle-double-right'></span>",
					"sNext": "<span class='fa fa-angle-right'></span>",
					"sPrevious": "<span class='fa fa-angle-left'></span>"
				},
				"oAria": {
					"sSortAscending": ": Activar para ordenar la columna de manera ascendente",
					"sSortDescending": ": Activar para ordenar la columna de manera descendente"
				}
			},
			ajax: {
				url: window.location.pathname,
				type: 'POST',
				data: {
					'action': 'detalle_compra',
					'id': parseInt(data.id),
				},
				dataSrc: ""
			},
			columns: [
				{"data": "producto.nombre"},
				{"data": "precio"},
				{"data": "cantidad"},
				{"data": "total_cantidad"},
			],
			columnDefs: [{
				targets: [-1],
				class: '',
				orderable: false,
				render: function(data, type, row) {
					return parseFloat(data).toFixed(2) + ' $';
				}

			},{
				targets: [-3],
				class: '',
				orderable: false,
				render: function(data, type, row) {
					return parseFloat(data).toFixed(2) + ' $';
				}

			}],
			initComplete: function (settings, json) {
					
			}
		});

		$("#modal_detalle").modal('show');
		
	});

});

function cerrar_modal_info() {
	$("#modal_detalle").modal("hide");
}

function cerrar_modal_pago() {
	$("#modal_pago").modal("hide");
}

function abrir_modal_pago_movil() {
	$("#modal_pago_movil").modal("show");
}

function cerrar_modal_pago_movil() {
	$("#modal_pago_movil").modal("hide");
}
function ShowSelected(){
	var time;
	var id = document.getElementById("id_dura").value;
	if(id == 'Corta duracion'){
		time = 1;
	}else if(id == 'Larga duracion'){
		time = 3;
	}
	return time;
}
// daterangepicker
$(function() {
	const tiempoTranscurrido = Date.now();
	const hoy = new Date(tiempoTranscurrido);

	$('#id_daterangepicker').on("focus", function(){
		$(this).daterangepicker({
			singleDatePicker: ShowSelected() == 1 ? true : false,
			timePicker: true,
			timePicker24Hour: true,
			timePickerIncrement: 1,
			showDropdowns: false,
			minDate: hoy,
			"maxSpan": {
	        	"days": ShowSelected(),
	    	},
			drops: 'down',
			"opens": "center",
			"locale": {
				"format": "DD-MM-YYYY",
				"separator": " / ",
				"applyLabel": "Aplicar",
				"cancelLabel": "Cancelar",
				"fromLabel": "De",
				"toLabel": "a",
				"customRangeLabel": "Custom",
				"daysOfWeek": [
					"Do",
					"Lu",
					"Ma",
					"Mi",
					"Ju",
					"Vi",
					"Sa"
				],
				"monthNames": [
					"Enero",
					"Febrero",
					"Marzo",
					"Abril",
					"Mayo",
					"Junio",
					"Julio",
					"Agosto",
					"Septiembre",
					"Octubre",
					"Noviembre",
					"Deciembre"
				],
				"firstDay": 1
			}
		}).on('apply.daterangepicker', function(ev, picker) {
	        id_fechaLlegada.value = picker.startDate.format('YYYY-MM-DD hh:mm');
	        id_fechaSalida.value = picker.endDate.format('YYYY-MM-DD hh:mm');
	    });
	});
});

// selects anidados para el formulario de reservaciones
$(function(){
	$('select[name="duracion"]').on('change', function(){
		var tipo = $(this).val();
		var habitaciones = $('select[name="habitacion"]');
		var option = '<option value="">-- Seleccione --</option>';
		if(tipo === ''){
			habitaciones.html(option);
			return false;
		}
		$.ajax({
			url : window.location.pathname,
			type: 'POST',
			data: {
				'action': 'buscar_habitacion',
				'tipo': tipo
			},
			dataType: 'json'
		}).done(function (data){
			if(!data.hasOwnProperty('error')){
				$.each(data, function (key, value) {
					option += '<option value="'+value.numeroHabitacion+'">'+'N° '+ value.numeroHabitacion+ ', '+ value.clase+': '+ value.tipoHabitacion +', precio: ' +value.precio+ '$'+'</option>';
				});
				return false;
			}
			message_error(data.error);
		}).fail(function (jqXHR,textStatus, errorThrown){
			alert(textStatus + ': ' + errorThrown);
		}).always(function (data){
			habitaciones.html(option);
		});
	});
});