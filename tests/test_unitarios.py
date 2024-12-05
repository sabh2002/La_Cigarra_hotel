from django.test import TestCase
from apps.reservacion.models import Productos, Clientes, Habitacion

class TestProductos(TestCase):

	def setUp(self):
		
		self.pro = Productos()
		self.pro.nombre_pro = 'Coca-Cola 1.5l'
		self.pro.descripcion = 'Coca-Cola de 1.5 litros'
		self.pro.stock = '10'
		self.pro.precio = '2'
		self.pro.save()
		
	def test_comprobar(self):
		self.assertEqual(self.pro.id, 1)

		self.pro = Productos.objects.get(id=1)
		self.assertEqual(self.pro.id, 1)

class TestClientes(TestCase):

	def setUp(self):
		
		self.cli = Clientes()
		self.cli.cedula = 25540392
		self.cli.nombre = 'Ana Karina'
		self.cli.apellido = 'Perez Torres'
		self.cli.direccion = 'Los proceres, calle sin nombre'
		self.cli.telefono = '04164309212'
		self.cli.save()
		
	def test_comprobar(self):
		self.assertEqual(self.cli.cedula, 25540392)

		self.cli = Clientes.objects.get(cedula=25540392)
		self.assertEqual(self.cli.cedula, '25540392')

class TestHabitacion(TestCase):

	def setUp(self):
		
		self.habi = Habitacion()
		self.habi.numeroHabitacion = 1
		self.habi.clase = 'Larga Duracion'
		self.habi.tipoHabitacion = 'Porton'
		self.habi.estado = 'Disponible'
		self.habi.precio = 20
		self.habi.descripcion = 'Habitacion del porton'
		self.habi.save()
		
	def test_comprobar(self):
		self.assertEqual(self.habi.numeroHabitacion, 1)

		self.habit = Habitacion.objects.get(numeroHabitacion=1)
		self.assertEqual(self.habit.numeroHabitacion, 1)

