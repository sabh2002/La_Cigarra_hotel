from django.test import TestCase
from apps.reservacion.models import (
    Reserva, 
	DetalleReserva, 
	Clientes, 
	Habitacion, 
	Productos,
	Venta,
	DetVenta
)
from datetime import date

class TestReservacion(TestCase):

	def setUp(self):
		
		self.habitacion = Habitacion()
		self.habitacion.numeroHabitacion = 1
		self.habitacion.clase = 'Larga Duracion'
		self.habitacion.tipoHabitacion = 'Normales'
		self.habitacion.estado = 'Disponible'
		self.habitacion.precio = int(15)
		self.habitacion.descripcion = 'Habitacion normal'
		self.habitacion.save()

		self.cliente = Clientes()
		self.cliente.cedula = '10053285'
		self.cliente.nombre = 'Jan Pablo'
		self.cliente.apellido = 'Gomez Fernandez'
		self.cliente.direccion = 'La Granja'
		self.cliente.telefono = '04124576532'
		self.cliente.is_staff = False
		self.cliente.save()

		self.reserva = Reserva.objects.create(
			estado = 'Aprobada',
			fechaReserva = '2023-05-20 19:13',
			cliente = Clientes.objects.get(cedula = '10053285'),
			origen = '00004352'
		)

		self.detReserva = DetalleReserva.objects.create(
			codigoReserva = Reserva.objects.get(id = 1),
			fechaLlegada = '2023-05-21 13:00',
			fechaSalida = '2023-05-23 17:00',
			habitacion = Habitacion.objects.get(numeroHabitacion = 1),
			cantidad = 45,
			total_bs = float(1125)
		)

	def test_comprobar(self):
		self.assertEqual(self.habitacion.numeroHabitacion, 1)
		self.assertEqual(self.cliente.cedula, '10053285')
		self.assertEqual(self.reserva.id, 1)

		self.detalle = DetalleReserva.objects.get(id=1)
		
		self.assertEqual(self.detalle.id, 1)

	def test_filtrar_reservacion_clientes(self):
		for t in Clientes.objects.all():
			reservas = Reserva.objects.filter(cliente__cedula = t)

	def test_filtrar_reservacion_habitacion(self):
		for x in Habitacion.objects.all():
			DetalleReserva.objects.filter(codigoReserva__estado = 'Aprobada', habitacion__numeroHabitacion = x.numeroHabitacion)
	
	def test_filtrar_reservacion_rango_fecha(self):
		Reserva.objects.filter(fechaReserva__gte='2023-05-01', fechaReserva__lt=date.today())


class TestVentas(TestCase):

	def setUp(self):
		
		self.pro = Productos.objects.create(
			nombre_pro = 'Condones DUO X3',
			descripcion = 'Condones marca DUO 3 unidades',
			stock = 30,
			precio = 2.50
		)

		self.cliente = Clientes.objects.create(
			cedula = 20300210,
			nombre = 'Jan Pablo',
			apellido = 'Gomez Fernandez',
			direccion = 'La Granja',
			telefono = '04124576532',
			is_staff = False
		)

		self.empleado = Clientes.objects.create(
			username = '19100200',
			cedula = 19100200,
			nombre = 'Jose Daniel',
			apellido = 'Rodriguez',
			direccion = 'Barrio la Arenosa',
			telefono = '04149872012',
			is_staff = True
		)

		self.venta = Venta.objects.create(
			fecha_venta = date.today(),
			vendedor = Clientes.objects.get(cedula = 19100200),
			total_dolar = 15,
			total_bs = float(375)
		)

		self.detalleVenta = DetVenta.objects.create(
			venta = Venta.objects.get(id = 1),
			producto = Productos.objects.get(id = 1),
			precio = Productos.objects.get(id = 1).precio,
			cantidad = 2,
			total_cantidad = float(2 * Productos.objects.get(id = 1).precio)
		)

		# REGISTRAR RESERVACION PARA ASIGNARLE UNA VENTA
		self.habitacion = Habitacion()
		self.habitacion.numeroHabitacion = 1
		self.habitacion.clase = 'Larga Duracion'
		self.habitacion.tipoHabitacion = 'Normales'
		self.habitacion.estado = 'Disponible'
		self.habitacion.precio = int(15)
		self.habitacion.descripcion = 'Habitacion normal'
		self.habitacion.save()

		self.cliente2 = Clientes()
		self.cliente2.username = '154039821'
		self.cliente2.cedula = 154039821
		self.cliente2.nombre = 'Jan Pablo'
		self.cliente2.apellido = 'Gomez Fernandez'
		self.cliente2.direccion = 'La Granja'
		self.cliente2.telefono = '04124576532'
		self.cliente2.is_staff = False
		self.cliente2.save()

		self.reserva = Reserva.objects.create(
			estado = 'Aprobada',
			fechaReserva = '2023-05-20 19:13',
			cliente = Clientes.objects.get(cedula = 154039821),
			origen = '00004352'
		)

		self.detReserva = DetalleReserva.objects.create(
			codigoReserva = Reserva.objects.get(id = 1),
			fechaLlegada = '2023-05-21 13:00',
			fechaSalida = '2023-05-23 17:00',
			habitacion = Habitacion.objects.get(numeroHabitacion = 1),
			cantidad = 45,
			total_bs = float(1125)
		)

	def test_comprobar(self):
		self.assertEqual(self.pro.id, 1)
		self.assertEqual(self.cliente.cedula, 20300210)
		self.assertEqual(self.empleado.cedula, 19100200)

		self.detalle = DetVenta.objects.get(id=1)
		
		self.assertEqual(self.detalle.id, 1)

		# DE LA RESERVACIÓN
		self.assertEqual(self.habitacion.numeroHabitacion, 1)
		self.assertEqual(self.cliente2.cedula, 154039821)
		self.assertEqual(self.reserva.id, 1)

		self.detalle = DetalleReserva.objects.get(id=1)
		
		self.assertEqual(self.detalle.id, 1)

	def test_filtrar_ventas_rango_fecha(self):
		Venta.objects.filter(fecha_venta__gte='2023-05-01', fecha_venta__lt=date.today())

	def test_filtrar_ventas_producto(self):
		for x in Productos.objects.all():
			DetVenta.objects.filter(producto__nombre_pro = x.nombre_pro)

	def test_filtar_venta_reservacion(self):
		reser =  Reserva.objects.get(id = 1)
		reser.compras = Venta.objects.get(id = 1)
		reser.save()