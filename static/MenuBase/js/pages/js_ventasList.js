var tablav;

// DATA DE LAS VENTAS
function getDataV() {
	tablav = $('#VentasList').DataTable({
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
				'action': 'listado_de_ventas'
			},
			dataSrc: ""
		},
		columns: [{
			"data": "fecha_venta"
		}, {
			"data": "total_dolar"
		}, {
			"data": "total_bs"
		}, {
			"data": "id"
		}],
		columnDefs: [{
			targets: [-1],
			class: 'text-center',
			orderable: false,
			render: function(data, type, row) {

				var buttons = '<a href="#" rel="detail" class="btn btn-icon btn-dark edit"><i class="fas fa-info"></i></a> ';
				//buttons += '<a href="#" rel="delete" class="btn btn-icon btn-dark delete"><i class="fas fa-trash"></i></a> ';
				return buttons;
			}

		},{
			targets: [-2],
			class: 'text-center',
			orderable: false,
			render: function(data, type, row) {

				return parseFloat(data).toFixed(2) + ' Bs.S';
			}

		},{
			targets: [-3],
			class: 'text-center',
			orderable: false,
			render: function(data, type, row) {

				return parseFloat(data).toFixed(2) + ' $';
			}

		}],
		initComplete: function(settings, json) {

		}
	});
};
$(function() {
	getDataV();
});

// BOTONES PARA LOS MODALES
function cerrar_modal_detalle() {
	$("#modal_detalle").modal("hide");
}

$(function() {

	// DETALLE DE VENTA
	$('#VentasList tbody').on('click', 'a[rel="detail"]', function () {

		var tr = tablav.cell($(this).closest('td, li')).index();
		var data = tablav.row(tr.row).data();

		$('#detalle_venta').DataTable({
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
					'action': 'detalle_venta',
					'id': parseInt(data.id),
				},
				dataSrc: ""
			},
			columns: [
				{"data": "id"},
				{"data": "producto.nombre"},
				{"data": "precio"},
				{"data": "cantidad"},
				{"data": "total_cantidad"},
			],
			columnDefs: [{
				targets: [-1],
				class: 'text-center',
				orderable: false,
				render: function(data, type, row) {
					return parseFloat(data).toFixed(2) + ' $';
				}

			},{
				targets: [-3],
				class: 'text-center',
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