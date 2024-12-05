var tablaS;

// LOGICA PARA AGREGAR INGRESOS
var vents = {
	items: {
		personal: '',
		reserva_id: 0,
		total_dolar: 0.00,
		total_bs: 0.00,
		det: []
	},
	productos: {},
	agregar_producto: function (id, existencia) {
		let producto = {
			'id':id,
			'existencia':existencia, 
			'a_vender': 0
		}
		
		if (!(this.productos.length === 0)) {
			this.productos[producto['id']] = producto
		} else if (!(this.productos[id])){
			this.productos[producto['id']] = producto
		};

	},
	get_ids: function() {
		var ids = [];
		$.each(this.items.det, function(key, value) {
			ids.push(value.id);
		});
		return ids;
	},
	calculate_invoice: function () {
		var subtotal = 0.00;
		var price_dollar = $('input[name="precio_dolar"]').val();
		$.each(this.items.det, function (pos, dict) {
			dict.total_dolar = dict.a_vender * dict.precio;

			subtotal += dict.total_dolar;

		});
		this.items.total_dolar = subtotal
		this.items.total_bs = this.items.total_dolar * parseFloat(price_dollar).toFixed(2);

		$('input[name="monto_total"]').val(this.items.total_dolar.toFixed(2))
		$('input[name="monto_total_bs"]').val(this.items.total_bs.toFixed(2))

	},
	validar_existencia_productos: function (){
		let validador = {}
		this.items.det.forEach(item => {
			var pr = vents.productos[item.id]['a_vender'] = parseInt(item.a_vender );
			vents.productos[item.id]['a_vender'] = parseInt(item.a_vender )
			if (parseInt(vents.productos[item.id]['a_vender']) > parseInt(vents.productos[item.id]['existencia'])) {
				validador['error'] = {'message': `El producto: ${item.text} no tiene esa cantidad disponible`, 'status':'error'}
			}
		})
		Object.entries(this.productos).forEach(([key, value]) => {
            vents.productos[key]['a_vender'] = 0;
        });
		
		return validador

	},
	add: function(item) {
		this.items.det.push(item);
		this.list()

	},
	list: function() {
		tblCate = $('#tblProducts').DataTable({
			responsive: true,
			autoWidth: false,
			destroy: true,
			ordering: false,
			searching: false,
			paging: false,
			info: false,
			"language": {
				"sProcessing": "Procesando...",
				"sLengthMenu": "Mostrar _MENU_ registros",
				"sZeroRecords": "No se encontraron resultados",
				"sEmptyTable": "Ningún dato disponible en esta tabla",
				"sInfo": "Mostrando _START_ al _END_ de un total de _TOTAL_ registros",
				"sInfoEmpty": "Mostrando 0 al 0 de un total de 0 registros",
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
			data: this.items.det,
			columns: [{
				"data": "id"
			}, {
				"data": "text"
			}, {
				"data": "precio"
			}, {
				"data": "existencia"
			}, {
				"data": "a_vender"
			}],
			columnDefs: [{
				targets: [0],
				class: '',
				orderable: false,
				render: function(data, type, row) {
					buttons = '<a href="#" rel="delete" class="btn btn-danger btn-small"><i class="fas fa-trash-alt"></i></a> ';
					return buttons;
				}
			}, {
				targets: [-3],
				class: '',
				orderable: false,
				render: function(data, type, row, meta) {
					return '<input type="number"  min="1" value="' + parseFloat(data) + '" name="precio" class="form-control form-control-sm precio-table" autocomplete="off" required readonly>';
				}
			}, {
				targets: [-2],
				class: '',
				orderable: false,
				render: function(data, type, row, meta) {
					return '<input type="number" name="stock" class="form-control form-control-sm stock-table" autocomplete="off" value="' + parseInt(data) + '" required readonly>';
				}
			} , {
				targets: [-1],
				class: '',
				orderable: false,
				render: function(data, type, row, meta) {
					return '<input type="number" name="cantidad" class="form-control form-control-sm cantidad-table" value="' + parseInt(data) + '" required min="1" placeholder="Cantidad a comprar">';
				}
			}],
			initComplete: function(settings, json) {

			},
		});

	},
};
$(function() {
	// auto complete search
	$('select[name="search"]').select2({
		theme: "bootstrap4",
		language: "es",
		allowClear: true,
		ajax: {
			delay: 250,
			type: "POST",
			url: window.location.pathname,
			data: function(params) {
				var queryParameters = {
					term: params.term,
					action: "listado_productos",
					ids: JSON.stringify(vents.get_ids())
				}
				return queryParameters;
			},
			processResults: function(data) {
				var results = [];

				$.each(data, function(index, res) {
					results.push({
						id: res.id,
						text: res.nombre_pro,
						precio: res.precio,
						existencia: res.stock,
					});
				});

				return {
					results: results
				};
			},
			cache: true

		},
		placeholder: 'Buscar producto ...',
		minimumInputLength: 1,
	}).on('select2:select', function(e) {
		var data = e.params.data;
		data.a_vender = 0;
		vents.add(data);
		vents.calculate_invoice();
		vents.agregar_producto(data.id, data.existencia);
		$(this).val('').trigger('change.select2');

	});

	$('#tblProducts tbody').on('change keyup', '.cantidad-table', function() {
		let cantidad = $(this).val();
		var tr = tblCate.cell($(this).closest('td, li')).index();
		vents.items.det[tr.row].a_vender = parseInt(cantidad);
		vents.calculate_invoice();
	});

	$('#tblProducts tbody').on('change keyup', '.precio-table', function() {
		let precio = $(this).val();
		var tr = tblCate.cell($(this).closest('td, li')).index();
		vents.items.det[tr.row].precio = precio;
	});

	// Eliminar el ingreso individual
	$('#tblProducts tbody').on('click', 'a[rel="delete"]', function() {
		var tr = tblCate.cell($(this).closest('td, li')).index();
		vents.items.det.splice(tr.row, 1);
		vents.list();
		toastr.success('Eliminado Correctamente')
		vents.calculate_invoice();

	});

	// event submit
	$('#form_venta').on('submit', function(e) {
		e.preventDefault();

		if (vents.items.det.length === 0) {
			toastr.error('Debe tener al menos un producto en la venta');
			return false;
		}

		vents.calculate_invoice();

		validar = vents.validar_existencia_productos();
		if (validar['error']) {
			if (validar['error']['status'] == 'error') {
				toastr.error(validar['error']['message'])
				return false;
			}
		};

		vents.items.personal = $('input[name="personal"]').val();
		vents.items.total_dolar = $('input[name="monto_total"]').val();
		vents.items.total_bs = $('input[name="monto_total_bs"]').val();
		vents.items.reserva_id = $('select[name="reserva_id"]').val();

		var parameters = new FormData();
		parameters.append('action', $('input[name="action"]').val());
		parameters.append('vents', JSON.stringify(vents.items));

		submit_with_ajax(window.location.pathname, 'Notifiación', '¿Estas seguro de realizar esta accion?', parameters, function() {
			window.location.replace('/listado-de-venta/');
			$("#form_venta")[0].reset();
			toastr.success('Se ha registrado correctamente');

		});
	});
});