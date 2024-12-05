from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.db import transaction
from datetime import date, datetime

# importaciones de modelos
from apps.reservacion.models import *

# Create your views here.

class Home(TemplateView):
	template_name = "LandingPage.html"

class HomeMenu(LoginRequiredMixin, TemplateView):
	template_name = "inicio.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'precio_dolar':
				print(request.POST)
				if PrecioDolar.objects.all():
					dolar = PrecioDolar.objects.get(code = 'dolar')
					dolar.precio = float(request.POST.get('precio'))
					dolar.save()
				else:
					dolar = PrecioDolar()
					dolar.precio = float(request.POST.get('precio'))
					dolar.save()
					

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
			print(data)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['dolar'] = PrecioDolar.objects.get(code = 'dolar')
		return context

class ReservacionView(LoginRequiredMixin, TemplateView):
	template_name = "pages/reservacion/Reservacion.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_reservacion':
				data = []
				for i in Reserva.objects.all().order_by('-id'):
					item = i.toJSON()
					data.append(item)               
			
			elif action == 'detail_reservacion':
				data = []
				for i in DetalleReserva.objects.filter(codigoReserva = int(request.POST.get('id'))):
					data.append(i.toJSON())

			elif action == 'aceptar_reserva':
				if request.user.is_staff:
					# reserva
					reser = Reserva.objects.get(id = request.POST.get('id'))
					reser.estado = 'Aprobada'
					
					# habitacion
					det = DetalleReserva.objects.get(codigoReserva = reser.id)
					det.habitacion.estado = 'Reservada' 
					det.save()
					reser.save()

			elif action == 'rechazar_reserva': 
				if request.user.is_staff:
					reser = Reserva.objects.get(id = request.POST.get('id'))
					reser.estado = 'Rechazada'
					reser.save()
			
			elif action == 'finalizar_reserva': 
				if request.user.is_staff:
					reser = Reserva.objects.get(id = request.POST.get('id'))
					reser.estado = 'Finalizada'
					reser.save()

					det = DetalleReserva.objects.get(codigoReserva = Reserva.objects.get(id = request.POST.get('id')) )
					habi = Habitacion.objects.get(numeroHabitacion = det.habitacion.numeroHabitacion)
					habi.estado = 'Mantenimiento'
					habi.save()
			
			elif action == 'cambiar_estado_habitacion': 
				if request.user.is_staff:
					reser = Reserva.objects.get(id = request.POST.get('id'))
					det = DetalleReserva.objects.get(codigoReserva = Reserva.objects.get(id = request.POST.get('id')) )
					habi = Habitacion.objects.get(numeroHabitacion = det.habitacion.numeroHabitacion)

					if reser.estado == "Aprobada":
						if habi.estado == 'Disponible' or habi.estado == 'Mantenimiento':
							habi.estado = 'Ocupada'
							habi.save()

						elif habi.estado == 'Ocupada':
							data['error'] = 'La Habitación esta ocupada'

					elif reser.estado == "Finalizada":
						data['error'] = 'La reservación ya finalizó'

			elif action == 'detalle_compra':
				reserva = Reserva.objects.get(id = int(request.POST.get('id') ) )

				data = []
				for i in DetVenta.objects.filter(venta__reservacion = reserva.id ):
					item = i.toJSON()
					data.append(item)

			else:
				data['error'] = 'Ha ocurrido un error' 

		except Exception as e:
			print(data)
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		return context

class ReservacionForm(LoginRequiredMixin, TemplateView):
	template_name = "pages/reservacion/Reservacion_form.html"
	
	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)
	
	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_reservacion':
				data = []
				for i in Reserva.objects.all():
					item = i.toJSON()
					data.append(item)

			elif action == 'new_reservacion':				
				# reserva
				reserva = Reserva()
				reserva.estado = 'Pendiente'
				reserva.cliente = Clientes.objects.get(cedula = request.POST.get('cliente'))
				reserva.origen = request.POST.get('origen')
				reserva.save()

				# detalles
				detalle = DetalleReserva()
				habi = Habitacion.objects.get(numeroHabitacion = request.POST.get('habitacion'))
				detalle.codigoReserva = Reserva.objects.get(id = reserva.id)
				detalle.fechaLlegada = datetime.strptime(request.POST.get('fechaLlegada'), '%Y-%m-%d %H:%M')
				detalle.fechaSalida = datetime.strptime(request.POST.get('fechaSalida'), '%Y-%m-%d %H:%M')
				if habi.clase == 'Corta duracion':
					detalle.fechaSalida = detalle.fechaSalida + timedelta(hours=4)
				detalle.habitacion = Habitacion.objects.get(numeroHabitacion = request.POST.get('habitacion'))
				dias = detalle.fechaSalida - detalle.fechaLlegada
				if dias.days > 1:
					detalle.cantidad = ( float(habi.precio) * int(dias.days) )
				else:
					detalle.cantidad = float(habi.precio)

				valor_dolar = PrecioDolar.objects.get(code = 'dolar')
				detalle.total_bs = ( float(detalle.cantidad) * float(valor_dolar.precio) )
				detalle.save()

			elif action == 'buscar_habitacion':
				data = []
				for i in Habitacion.objects.filter(estado='Disponible', clase=request.POST['tipo']).exclude(estado = 'Deshabilitada'):
					item = i.toJSON()
					data.append(item)
			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super(ReservacionForm, self).get_context_data(**kwargs)
		context['proximas'] = DetalleReserva.objects.filter(codigoReserva__estado = "Aprobada", fechaSalida__gte= date.today())
		return context

class HabitacionView(LoginRequiredMixin, TemplateView):
	template_name = "pages/habitacion/habitacion.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_habitacion':
				data = []
				for i in Habitacion.objects.all().order_by('numeroHabitacion'):
					item = i.toJSON()
					data.append(item)

			elif action == 'new_habitacion':
				if Habitacion.objects.filter(numeroHabitacion = request.POST.get('numeroHabitacion')):
					data['error'] = 'Ya existe una habitacion registrada con este numero'
				else:
					habi = Habitacion()
					habi.numeroHabitacion = request.POST.get('numeroHabitacion')
					habi.tipoHabitacion = request.POST.get('tipoHabitacion')
					habi.clase = request.POST.get('clase')
					habi.estado = request.POST.get('estado')
					habi.precio = int(request.POST.get('precio'))
					habi.descripcion = request.POST.get('descripcion')
					habi.save()

			elif action == 'edit_habitacion':
				habi = Habitacion.objects.get(numeroHabitacion=request.POST.get('id'))
				habi.tipoHabitacion = request.POST.get('tipoHabitacion')
				habi.clase = request.POST.get('clase')
				habi.estado = request.POST.get('estado')
				habi.precio = int(request.POST.get('precio'))
				habi.descripcion = request.POST.get('descripcion')
				habi.save()

			elif action == 'delete_habitacion':
				habi = Habitacion.objects.get(numeroHabitacion=request.POST.get('id'))
				habi.estado = 'Deshabilitada'
				habi.save()

			elif action == 'habilitar_habitacion':
				habi = Habitacion.objects.get(numeroHabitacion=request.POST.get('id'))
				habi.estado = 'Disponible'
				habi.save()

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		return context

class InventarioView(LoginRequiredMixin, TemplateView):
	template_name = "pages/inventario/inventario.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_productos':
				data = []
				for i in Productos.objects.all():
					item = i.toJSON()
					data.append(item)

			elif action == 'new_producto':
				prod = Productos()
				prod.nombre_pro = request.POST.get('nombre_pro')
				prod.descripcion = request.POST.get('descripcion')
				prod.stock = request.POST.get('stock')
				prod.precio = float(request.POST.get('precio'))
				prod.save()

			elif action == 'edit_producto':
				prod = Productos.objects.get(id= request.POST.get('id'))
				prod.nombre_pro = request.POST.get('nombre_pro')
				prod.descripcion = request.POST.get('descripcion')
				prod.stock = request.POST.get('stock')
				prod.precio = float(request.POST.get('precio'))
				prod.save()

			elif action == 'delete_producto':
				prod = Productos.objects.get(id= request.POST.get('id'))
				prod.delete()
			
			elif action == 'agregar_stock':
				prod = Productos.objects.get(id= request.POST.get('id'))
				prod.stock = (int(prod.stock) + int(request.POST.get('mas_stock')))
				prod.save()

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		return context

class ClientesView(LoginRequiredMixin, TemplateView):
	template_name = "pages/clientes/clientes.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_clientes':
				data = []
				for i in Clientes.objects.all().exclude(is_staff = True):
					item = i.toJSON()
					data.append(item)

			elif action == 'new_cliente':
				
				if Clientes.objects.filter(cedula = request.POST.get('cedula')):
					data['error'] = 'El Cliente ya esta registrado'
				else:
					cli = Clientes()
					cli.cedula = request.POST.get('cedula')
					cli.nombre = request.POST.get('nombre')
					cli.apellido = request.POST.get('apellido')
					cli.direccion = request.POST.get('direccion')
					cli.telefono = request.POST.get('telefono')
					# registrarlo como usuario para que ingrese al sistema, usuario y clave sera la cedula
					cli.username = request.POST.get('cedula')
					cli.set_password(request.POST.get('cedula'))
					cli.is_staff = False
					cli.save()

			elif action == 'edit_cliente':
				cli = Clientes.objects.get(cedula= request.POST.get('id'))
				cli.nombre = request.POST.get('nombre')
				cli.apellido = request.POST.get('apellido')
				cli.direccion = request.POST.get('direccion')
				cli.telefono = request.POST.get('telefono')
				cli.save()

			elif action == 'delete_cliente':
				cli = Clientes.objects.get(cedula= request.POST.get('id'))
				cli.delete()

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		return context

class MisReservaciones(LoginRequiredMixin, TemplateView):
	template_name = "pages/reservacion/mis_reservaciones.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_reservacion':
				data = []
				for i in Reserva.objects.filter(cliente = request.user.username):
					item = i.toJSON()
					data.append(item)

			elif action == 'detail_reservacion':
				data = []
				for i in DetalleReserva.objects.filter(codigoReserva = int(request.POST.get('id'))):
					data.append(i.toJSON())

			elif action == 'agregar_pago':
				reser = Reserva.objects.get(id = request.POST.get('id'))
				reser.origen = request.POST.get('origen')
				reser.save()
			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['pago_movil'] = DatosPagoMovil.objects.all()
		return context

class NewUser(TemplateView):
	template_name = "registration/register.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'registrar_cliente':
				if Clientes.objects.filter(cedula = request.POST.get('cedula')):
					data['error'] = 'El Cliente ya esta registrado'
				else:
					cli = Clientes()
					cli.cedula = request.POST.get('cedula')
					cli.nombre = request.POST.get('nombre')
					cli.apellido = request.POST.get('apellido')
					cli.direccion = request.POST.get('direccion')
					cli.telefono = request.POST.get('telefono')
					cli.username = request.POST.get('cedula')
					cli.set_password(request.POST.get('password'))
					cli.is_staff = False
					cli.save()

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		return context

class NewAdminUser(LoginRequiredMixin, TemplateView):
	template_name = "registration/admin_register.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_admin':
				data = []
				for i in Clientes.objects.filter(is_staff = True):
					item = i.toJSON()
					data.append(item)

			elif action == 'new_admin':
				if Clientes.objects.filter(cedula = request.POST.get('cedula')):
					data['error'] = 'Este empleado ya esta registrado'
				else:
					cli = Clientes()
					cli.cedula = request.POST.get('cedula')
					cli.nombre = request.POST.get('nombre')
					cli.apellido = request.POST.get('apellido')
					cli.direccion = request.POST.get('direccion')
					cli.telefono = request.POST.get('telefono')
					cli.username = request.POST.get('cedula')
					cli.set_password(request.POST.get('password'))
					cli.is_staff = True
					cli.save()

			elif action == 'delete_admin':
				cli = Clientes.objects.get(cedula= request.POST.get('id'))
				cli.delete()

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		return context

class ViewPagoMovil(LoginRequiredMixin,TemplateView):
	template_name = "pages/pagoMovil/lista_pagomovil.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_pago_movil':
				data = []
				for i in DatosPagoMovil.objects.all():
					item = i.toJSON()
					data.append(item)

			elif action == 'nuevo_pago_movil':
				pm = DatosPagoMovil()
				pm.banco = request.POST.get('banco')
				pm.telefono = request.POST.get('telefono')
				pm.cedula = request.POST.get('cedula')
				pm.save()

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		return context

class VentasForm(LoginRequiredMixin,TemplateView):
	template_name = "pages/ventas/ventas_form.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_productos':
				data = []
				ids_exclude = json.loads(request.POST['ids'])
				prod = Productos.objects.filter(nombre_pro__icontains=request.POST['term'], stock__gte=1)
				for i in prod.exclude(id__in=ids_exclude)[0:10]:
					item = i.toJSON()
					item['id'] = i.id
					item['producto'] = i.nombre_pro
					item['stock'] = i.stock
					item['precio'] = float(i.precio)
					data.append(item)
			
			elif action == 'agregar_venta':
				with transaction.atomic():
					venta_js = json.loads(request.POST['vents'])
					print(venta_js)

					venta = Venta()
					venta.vendedor = Clientes.objects.get(cedula = venta_js['personal'])
					venta.total_dolar = float(venta_js['total_dolar'])
					venta.total_bs = float(venta_js['total_bs'])
					if venta_js['reserva_id']:
						venta.reservacion = Reserva.objects.get(id = venta_js['reserva_id'])
						re = DetalleReserva.objects.get(codigoReserva__id = venta_js['reserva_id'])
						re.cantidad = float(re.cantidad + venta.total_dolar)
						re.total_bs =  float(re.total_bs + venta.total_bs)
						re.save()
					venta.save()

					for i in venta_js['det']:
						det_venta = DetVenta()
						det_venta.venta = Venta.objects.get(id = venta.id)
						det_venta.producto = Productos.objects.get(id = i['id'])
						det_venta.cantidad = int(i['a_vender'])
						det_venta.precio = float(i['precio'])
						det_venta.total_cantidad = float(i['total_dolar'])
						det_venta.save()

						prod = Productos.objects.get(id= i['id'])
						prod.stock = (int(prod.stock) - int(i['a_vender']))
						prod.save()

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['precio_dolar'] = PrecioDolar.objects.get(code = 'dolar')
		context['reserva'] = Reserva.objects.filter(estado =  'Aprobada')
		return context

class ListadoVentas(LoginRequiredMixin, TemplateView):
	template_name = "pages/ventas/listado_ventas.html"

	@method_decorator(csrf_exempt)
	def dispatch(self, request, *args, **kwargs):
		return super().dispatch(request, *args, **kwargs)

	def post(self, request, *args, **kwargs):
		data = {}
		try:
			action = request.POST['action']
			
			if action == 'listado_de_ventas':
				data = []
				for i in Venta.objects.all():
					item = i.toJSON()
					data.append(item)
			
			elif action == 'detalle_venta':
				data = []
				for i in DetVenta.objects.filter(venta = int(request.POST.get('id') )):
					item = i.toJSON()
					data.append(item)

			else:
				data['error'] = 'Ha ocurrido un error'           

		except Exception as e:
			data['error'] = str(e)
		return JsonResponse(data, safe=False)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		return context

class MenuReportes(LoginRequiredMixin, TemplateView):
	template_name = "reportes/menu_reportes.html"