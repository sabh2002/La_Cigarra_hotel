var tablaC;
var modal_title;

// DATA DE INVENTARIO
function getDataC() {
	tablaC = $('#Clientes').DataTable({
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
				'action': 'listado_clientes'
			},
			dataSrc: ""
		},
		columns: [{
			"data": "cedula"
		}, {
			"data": "nombre"
		}, {
			"data": "apellido"
		}, {
			"data": "direccion"
		},{
			"data": "telefono"
		}, {
			"data": "telefono"
		}],
		columnDefs: [{
			targets: [-1],
			class: 'text-center',
			orderable: false,
			render: function(data, type, row) {

				var buttons = '<a href="#" rel="edit" class="btn btn-icon btn-dark edit"><i class="fas fa-edit"></i></a> ';
				buttons += '<a href="#" rel="delete" class="btn btn-icon btn-dark delete"><i class="fas fa-trash"></i></a> ';
				return buttons;
			}

		}],
		initComplete: function(settings, json) {

		}
	});
};
$(function() {
	getDataC();
});

// BOTONES PARA LOS MODALES
function abrir_modal_clientes() {
	$("#modal_clientes").modal("show");
	$('input[name="action"]').val('new_cliente');
	$('input[name="id"]').val(0);
	$('input[name="cedula"]').removeAttr('disabled');
	modal_title.html('Registrar Cliente');
}

function cerrar_modal_clientes() {
	$("#modal_clientes").modal("hide");
	$("#cliente_form")[0].reset();
	$('input[name="action"]').val('new_cliente');
	$('input[name="id"]').val(0);
}

// REGISTRAR CLIENTES
/* FORM SUBMIT AJAX*/
$('#cliente_form').on('submit', function(e) {
	e.preventDefault();
	var parameters = new FormData(this);
	submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de realizar esta accion?', parameters, function() {
		$("#modal_clientes").modal('hide');
		getDataC();
		toastr.success('Se ha registrado correctamente','Operación exitosa');
		$("#cliente_form")[0].reset();
	});
});

$(function() {
	// EDICION DE CLIENTES
	modal_title = $('#backDropModalTitle');
	$("#Clientes tbody").on('click', 'a[rel="edit"]', function() {
		modal_title.html('Editar Cliente');
		var tr = tablaC.cell($(this).closest('td, li')).index();
		var data = tablaC.row(tr.row).data();

		$('input[name="cedula"]').attr('disabled', 'disabled');

		$('input[name="action"]').val('edit_cliente');
		$('input[name="id"]').val(data.cedula);
		$('input[name="cedula"]').val(data.cedula);
		$('input[name="nombre"]').val(data.nombre);
		$('input[name="apellido"]').val(data.apellido);
		$('input[name="telefono"]').val(data.telefono);
		$('textarea[name="direccion"]').val(data.direccion);

		$("#modal_clientes").modal('show');
	});

	// ELIMINAR CLIENTES
	$('#Clientes tbody').on('click', 'a[rel="delete"]', function () {

		var tr = tablaC.cell($(this).closest('td, li')).index();
		var data_status = tablaC.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'delete_cliente');
		parameters.append('id', data_status.cedula);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de eliminar al Cliente?', parameters, function () {
			toastr.success('Se ha eliminado correctamente', 'Operación exitosa');
			getDataC();
		});  

	});
});