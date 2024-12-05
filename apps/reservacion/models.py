from django.db import models
from django.contrib.auth.models import AbstractUser
from django.forms import model_to_dict
from datetime import datetime, date, timedelta

# Create your models here.

estado_reserva = (
    ('Aprobada','Aprobada'),
    ('Pendiente', 'Pendiente'),
    ('Rechazada', 'Rechazada'),
)
estado_habitacion = (
    ('Disponible','Disponible'),
    ('Ocupada', 'Ocupada'),
    ('Reservada', 'Reservada'),
    ('Mantenimiento', 'Mantenimiento'),
    ('Inhabilitada', 'Inhabilitada'),
)

class Clientes(AbstractUser):
	cedula = models.CharField(max_length=8, primary_key=True, unique=True, blank=False, null=False)
	nombre = models.CharField(max_length=50, blank=False, null=False)
	apellido = models.CharField(max_length=50,  blank=False, null=False)
	direccion = models.CharField(max_length=50,  blank=True, null=True)
	telefono = models.CharField(max_length=11, blank=True, null=True)

	def __str__(self):
		return f"{self.nombre} {self.apellido}"

	def toJSON(self):
		item = model_to_dict(self)
		return item

	class Meta:
		verbose_name = 'Cliente'
		verbose_name_plural = 'Clientes'

class Habitacion(models.Model):
	numeroHabitacion = models.IntegerField(primary_key=True)
	clase = models.CharField(max_length=50, blank=False, null=False)
	tipoHabitacion = models.CharField(max_length=25)
	estado = models.CharField(max_length=25, blank=False, null=False)
	precio = models.IntegerField()
	descripcion = models.TextField()

	def __str__(self):
		return f"{self.numeroHabitacion}"

	def toJSON(self):
		item = model_to_dict(self)
		return item

	class Meta:
		verbose_name = 'Habitacion'
		verbose_name_plural = 'Habitaciones'


class Reserva(models.Model):
	estado = models.CharField(max_length=25, choices=estado_reserva, default='Pendiente')
	fechaReserva = models.DateTimeField(auto_now_add=True)
	cliente = models.ForeignKey(Clientes, on_delete=models.PROTECT)
	origen = models.CharField(max_length=25, null=True, blank=True)

	def __str__(self):
		return f"{self.id}"

	def toJSON(self):
		item = model_to_dict(self)
		item['fechaReserva'] = self.fechaReserva.strftime('%d/%m/%Y, %H:%M')
		item['cliente'] = {'nombre':self.cliente.nombre, 'apellido':self.cliente.apellido, 'ci':self.cliente.cedula}
		return item
		

	class Meta:
		verbose_name = 'Reserva'
		verbose_name_plural = 'Reservas'

class DetalleReserva(models.Model):
	codigoReserva = models.ForeignKey(Reserva, on_delete=models.CASCADE)
	fechaLlegada = models.DateTimeField(null=False, blank=False)
	fechaSalida = models.DateTimeField(null=False, blank=False)
	habitacion = models.ForeignKey(Habitacion, on_delete=models.CASCADE, related_name='habitacion')
	cantidad = models.FloatField()
	total_bs = models.FloatField()

	def __str__(self):
		return f"{self.id}"

	def toJSON(self):
		item = model_to_dict(self)
		item['habitacion'] = {'numero': self.habitacion.numeroHabitacion}
		item['fechaLlegada'] = self.fechaLlegada.strftime('%d/%m/%Y, %H:%M')
		item['fechaSalida'] = self.fechaSalida.strftime('%d/%m/%Y, %H:%M')
		return item

class Productos(models.Model):
	nombre_pro = models.CharField(max_length=50, null=False, blank=False)
	descripcion = models.TextField(null=True, blank=True)
	stock = models.IntegerField(null=False, blank=False)
	precio = models.FloatField(null=False, blank=False)

	def __str__(self):
		return f"{self.nombre_pro}"

	def toJSON(self):
		item = model_to_dict(self)
		return item

	class Meta:
		verbose_name = 'Producto'
		verbose_name_plural = 'Productos'

class PrecioDolar(models.Model):
	code = models.CharField(default='dolar', max_length=50, primary_key=True, blank=False, null=False) 
	precio = models.FloatField(blank=False, null=False)

	def __str__(self):
		return f'{self.precio}'

	class Meta:
		verbose_name = 'Precio Dolar'

class DatosPagoMovil(models.Model):
	banco = models.CharField(null=False, blank=False, max_length=50)
	telefono = models.CharField(null=False, blank=False, max_length=50)
	cedula = models.CharField(null=False, blank=False, max_length=50)

	def __str__(self):
		return f"{self.banco}"

	def toJSON(self):
		item = model_to_dict(self)
		return item

	class Meta:
		verbose_name = 'Pago Movil'

# VENTAS

class Venta(models.Model):
	fecha_venta = models.DateTimeField(null=False, blank=False, auto_now_add=True)
	vendedor = models.ForeignKey(Clientes, on_delete=models.PROTECT, null=False, blank=False)
	reservacion = models.ForeignKey(Reserva, on_delete=models.PROTECT, null=True, blank=True)
	total_dolar = models.FloatField(null=False, blank=False)
	total_bs = models.FloatField(null=False, blank=False)

	def __str__(self):
		return str(self.id)

	def toJSON(self):
		item = model_to_dict(self)
		item['fecha_venta'] = self.fecha_venta.strftime('%d/%m/%Y, %H:%M')
		return item

	class Meta:
		verbose_name = 'Venta'
		verbose_name_plural = 'Ventas'

class DetVenta(models.Model):
	venta = models.ForeignKey(Venta, on_delete=models.PROTECT, null=False, blank=False)
	producto = models.ForeignKey(Productos, on_delete=models.PROTECT, null=False, blank=False)
	precio = models.FloatField(null=False, blank=False)
	cantidad = models.IntegerField(null=False, blank=False)
	total_cantidad = models.FloatField(null=False, blank=False)

	def __str__(self):
		return str(self.id)

	def toJSON(self):
		item = model_to_dict(self)
		item['producto'] = {'nombre': self.producto.nombre_pro, 'precio': self.producto.precio}
		item['venta'] = {'total_bs': self.venta.total_bs, 'total_dolar': self.venta.total_dolar}
		return item

	class Meta:
		verbose_name = 'Detales de venta'
		verbose_name_plural = 'Detalles de ventas'