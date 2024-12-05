var tablaPM;

// DATA DE PAGOMOVIL
function getDataPM() {
	tablaPM = $('#pagoMovil').DataTable({
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
				'action': 'listado_pago_movil'
			},
			dataSrc: ""
		},
		columns: [{
			"data": "banco"
		}, {
			"data": "telefono"
		}, {
			"data": "cedula"
		}, {
			"data": "cedula"
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
	getDataPM();
});

// BOTONES PARA LOS MODALES
function abrir_modal_pagomovil() {
	$("#modal_pagomovil").modal("show");
	$('input[name="action"]').val('nuevo_pago_movil');
	$('input[name="id"]').val(0);
	modal_title.html('Registrar Producto');
}

function cerrar_modal_pagomovil() {
	$("#modal_pagomovil").modal("hide");
	$("#form_pagomovil")[0].reset();
	$('input[name="action"]').val('nuevo_pago_movil');
	$('input[name="id"]').val(0);
}

// REGISTRAR PAGOMOVIL
/* FORM SUBMIT AJAX*/
$('#form_pagomovil').on('submit', function(e) {
	e.preventDefault();
	var parameters = new FormData(this);
	submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de realizar esta accion?', parameters, function() {
		$("#modal_pagomovil").modal('hide');
		getDataPM();
		toastr.success('Se ha registrado correctamente', 'Operación exitosa');
		$("#form_pagomovil")[0].reset();
	});
});

$(function() {

	// ELIMINAR PAGOMOVIL
	$('#pagoMovil tbody').on('click', 'a[rel="delete"]', function () {

		var tr = tablaPM.cell($(this).closest('td, li')).index();
		var data_status = tablaPM.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'delete_producto');
		parameters.append('id', data_status.id);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de eliminar el producto?', parameters, function () {
			toastr.success('Se ha eliminado correctamente', 'Operación exitosa');
			getDataPM();
		});  

	});
});