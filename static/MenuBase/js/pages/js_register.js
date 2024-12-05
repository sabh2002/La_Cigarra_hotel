var tablaA;
var modal_title;

function getDataA() {
	tablaA = $('#Administradores').DataTable({
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
				'action': 'listado_admin'
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
				var buttons = '<a href="#" rel="delete" class="btn btn-icon btn-dark delete"><i class="fas fa-trash"></i></a> ';
				return buttons;
			}

		}],
		initComplete: function(settings, json) {

		}
	});
};
$(function() {
	getDataA();
});

// BOTONES PARA LOS MODALES
function abrir_modal_admin() {
	$("#modal_admin").modal("show");
	$('input[name="id"]').val(0);
	$('input[name="action"]').val('new_admin');
	modal_title.html('Registrar Cliente');
}

function cerrar_modal_admin() {
	$("#modal_admin").modal("hide");
	$('input[name="action"]').val('new_admin');
	$('input[name="id"]').val(0);
	$("#admin_form")[0].reset();
}

/* FORM SUBMIT AJAX*/
$('#admin_form').on('submit', function(e) {
	e.preventDefault();
	var parameters = new FormData(this);
	submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de realizar esta accion?', parameters, function() {
		$("#modal_admin").modal('hide');
		getDataA();
		toastr.success('Se ha registrado correctamente', 'Operación exitosa');
		$("#admin_form")[0].reset();
	});
});

$(function() {
	$('#Administradores tbody').on('click', 'a[rel="delete"]', function () {

		var tr = tablaA.cell($(this).closest('td, li')).index();
		var data_status = tablaA.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'delete_admin');
		parameters.append('id', data_status.cedula);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de eliminar al administrador?', parameters, function () {
			toastr.success('Se ha eliminado correctamente', 'Operación exitosa');
			getDataA();
		});  

	});
});