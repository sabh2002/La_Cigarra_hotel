var tablaH;
var modal_title;

// DATA DE RESERVACION
function getDataH() {
	tablaH = $('#Habitacion').DataTable({
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
				'action': 'listado_habitacion'
			},
			dataSrc: ""
		},
		columns: [{
			"data": "numeroHabitacion"
		}, {
			"data": "clase"
		},{
			"data": "tipoHabitacion"
		}, {
			"data": "precio"
		}, {
			"data": "estado"
		}, {
			"data": "descripcion"
		}, {
			"data": "descripcion"
		}],
		columnDefs: [{
			targets: [-1],
			class: 'text-center',
			orderable: false,
			render: function(data, type, row) {

				var buttons = '<a href="#" rel="edit" class="btn btn-icon btn-dark edit"><i class="fas fa-edit"></i></a> ';
				if(row['estado'] == 'Disponible' || row['estado'] == 'Mantenimiento'){
					buttons += '<a href="#" rel="delete" class="btn btn-icon btn-danger delete"><i class="fas fa-power-off"></i></a> ';
				}
				if(row['estado'] == 'Deshabilitada'){
					buttons += '<a href="#" rel="activar" class="btn btn-icon btn-success delete"><i class="bx bx-power-off"></i></a> ';
				}
				return buttons;
			}

		}],
		initComplete: function(settings, json) {

		}
	});
};
$(function() {
	getDataH();
});

// BOTONES PARA LOS MODALES
function abrir_modal_habitacion() {
	$("#modal_habitacion").modal("show");
	$('input[name="action"]').val('new_habitacion');
	$('input[name="id"]').val(0);
	modal_title.html('Registrar Habitación');
	$('input[name="numeroHabitacion"]').removeAttr('readonly');
}

function cerrar_modal_habitacion() {
	$("#modal_habitacion").modal("hide");
	$("#habitacion_form")[0].reset();
	$('input[name="action"]').val('new_habitacion');
	$('input[name="id"]').val(0);
}

// REGISTRAR HABITACION
/* FORM SUBMIT AJAX*/
$('#habitacion_form').on('submit', function(e) {
	e.preventDefault();
	var parameters = new FormData(this);
	submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de realizar esta accion?', parameters, function() {
		$("#modal_habitacion").modal('hide');
		getDataH();
		toastr.success('Se ha registrado correctamente', 'Operación exitosa');
		$("#habitacion_form")[0].reset();
	});
});

$(function() {
	// EDICION DE LA HABITACION
	modal_title = $('#backDropModalTitle');
	$("#Habitacion tbody").on('click', 'a[rel="edit"]', function() {
		modal_title.html('Editar Habitación');
		var tr = tablaH.cell($(this).closest('td, li')).index();
		var data = tablaH.row(tr.row).data();

		$('input[name="numeroHabitacion"]').attr('readonly', '');
		$('input[name="action"]').val('edit_habitacion');
		$('input[name="id"]').val(data.numeroHabitacion);
		$('input[name="numeroHabitacion"]').val(data.numeroHabitacion);
		$('select[name="clase"]').val(data.clase);
		$('select[name="estado"]').val(data.estado);
		$('select[name="tipoHabitacion"]').val(data.tipoHabitacion);
		$('input[name="precio"]').val(data.precio);
		$('textarea[name="descripcion"]').val(data.descripcion);

		$("#modal_habitacion").modal('show');
	});

	// DESHABILITAR HABITACION
	$('#Habitacion tbody').on('click', 'a[rel="delete"]', function () {

		var tr = tablaH.cell($(this).closest('td, li')).index();
		var data_status = tablaH.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'delete_habitacion');
		parameters.append('id', data_status.numeroHabitacion);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de eliminar la habitación?', parameters, function () {
			toastr.success('Se ha deshabilitado correctamente', 'Operación exitosa');
			getDataH();
		});
	});

  // HABILITAR HABITACION
	$('#Habitacion tbody').on('click', 'a[rel="activar"]', function () {

		var tr = tablaH.cell($(this).closest('td, li')).index();
		var data_status = tablaH.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'habilitar_habitacion');
		parameters.append('id', data_status.numeroHabitacion);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de eliminar la habitación?', parameters, function () {
			toastr.success('Se ha habilitado correctamente', 'Operación exitosa');
			getDataH();
		});
	});
});
//OCULTAR EL TIPO DE HABITACION SEGUN LA SELECCION
$("#id_clase").change(function(){
  var clase = $("#id_clase").val();
  if (clase == "Larga duracion" ){
	$(".ocultar").addClass('ocult');
	$("#id_tipoHabitacion").val(null);
  }else{
	$(".ocultar").removeClass('ocult');
  }
});