var tablaI;
var modal_title;

// DATA DE INVENTARIO
function getDataI() {
	tablaI = $('#Inventario').DataTable({
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
				'action': 'listado_productos'
			},
			dataSrc: ""
		},
		columns: [{
			"data": "nombre_pro"
		}, {
			"data": "descripcion"
		}, {
			"data": "stock"
		}, {
			"data": "precio"
		}, {
			"data": "descripcion"
		}],
		columnDefs: [{
			targets: [-1],
			class: 'text-center',
			orderable: false,
			render: function(data, type, row) {

				var buttons = '<a href="#" rel="edit" class="btn btn-icon btn-dark edit"><i class="fas fa-edit"></i></a> ';
				buttons += '<a href="#" rel="delete" class="btn btn-icon btn-dark delete"><i class="fas fa-trash"></i></a> ';
				buttons += '<a href="#" rel="add" class="btn btn-icon btn-success delete"><i class="fas fa-plus"></i></a> ';
				return buttons;
			}

		}],
		initComplete: function(settings, json) {

		}
	});
};
$(function() {
	getDataI();
});

// BOTONES PARA LOS MODALES
function abrir_modal_inventario() {
	$("#modal_inventario").modal("show");
	$('input[name="action"]').val('new_producto');
	$('input[name="id"]').val(0);
	modal_title.html('Registrar Producto');
}

function cerrar_modal_inventario() {
	$("#modal_inventario").modal("hide");
	$("#producto_form")[0].reset();
	$('input[name="action"]').val('new_producto');
	$('input[name="id"]').val(0);
}

//STOCK
function cerrar_modal_stock() {
	$("#modal_stock").modal("hide");
	$("#form_stock")[0].reset();
	$('input[name="action"]').val('agregar_stock');
	$('input[name="id"]').val(0);
}

// REGISTRAR HABITACION
/* FORM SUBMIT AJAX*/
$('#producto_form').on('submit', function(e) {
	e.preventDefault();
	var parameters = new FormData(this);
	submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de realizar esta accion?', parameters, function() {
		$("#modal_inventario").modal('hide');
		getDataI();
		toastr.success('Se ha registrado correctamente', 'Operación exitosa');
		$("#producto_form")[0].reset();
	});
});

$('#form_stock').on('submit', function(e) {
	e.preventDefault();
	var parameters = new FormData(this);
	submit_with_ajax(window.location.pathname, 'Notificación', '¿Estas seguro de realizar esta accion?', parameters, function() {
		$("#modal_stock").modal("hide");
		getDataI();
		toastr.success('Se ha registrado correctamente', 'Operación exitosa');
		$("#form_stock")[0].reset();
	});
});


$(function() {
	// EDICION DE PRODUCTOS
	modal_title = $('#backDropModalTitle');
	$("#Inventario tbody").on('click', 'a[rel="edit"]', function() {
		modal_title.html('Editar Producto');
		var tr = tablaI.cell($(this).closest('td, li')).index();
		var data = tablaI.row(tr.row).data();

		$('input[name="action"]').val('edit_producto');
		$('input[name="id"]').val(data.id);
		$('input[name="nombre_pro"]').val(data.nombre_pro);
		$('textarea[name="descripcion"]').val(data.descripcion);
		$('input[name="stock"]').val(data.stock);
		$('input[name="precio"]').val(data.precio);

		$("#modal_inventario").modal('show');
	});

	// ELIMINAR PRODUCTO
	$('#Inventario tbody').on('click', 'a[rel="delete"]', function () {

		var tr = tablaI.cell($(this).closest('td, li')).index();
		var data_status = tablaI.row(tr.row).data();
		
		var parameters = new FormData();
		parameters.append('action', 'delete_producto');
		parameters.append('id', data_status.id);
		submit_with_ajax(window.location.pathname,'Notificación', '¿Estas seguro de eliminar el producto?', parameters, function () {
			toastr.success('Se ha eliminado correctamente', 'Operación exitosa');
			getDataI();
		});  

	});

	// SUMAR STOCK
	$("#Inventario tbody").on('click', 'a[rel="add"]', function() {
		var tr = tablaI.cell($(this).closest('td, li')).index();
		var data = tablaI.row(tr.row).data();

		$('input[name="action"]').val('agregar_stock');
		$('input[name="id"]').val(data.id);
		$("#modal_stock").modal('show');
	});

});