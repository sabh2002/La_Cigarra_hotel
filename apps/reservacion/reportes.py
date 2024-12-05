# IMPORTACIONES PARA LOS REPORTES
import os
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.template.loader import get_template
from django.contrib.staticfiles import finders
from django.views.generic.base import View
from xhtml2pdf import pisa
from django.urls import reverse_lazy
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.decorators import method_decorator
import datetime
from datetime import datetime
from django.utils.dateparse import parse_date
from datetime import timedelta, date
from django.db.models import Count

from apps.reservacion.models import *

def link_callback(uri, rel):
	"""
	Convert HTML URIs to absolute system paths so xhtml2pdf can access those
	resources
	"""
	# use short variable names
	sUrl = settings.STATIC_URL  # Typically /static/
	sRoot = settings.STATIC_ROOT  # Typically /home/userX/project_static/
	mUrl = settings.MEDIA_URL  # Typically /static/media/
	mRoot = settings.MEDIA_ROOT  # Typically /home/userX/project_static/media/

	# convert URIs to absolute system paths
	if uri.startswith(mUrl):
		path = os.path.join(mRoot, uri.replace(mUrl, ""))
		print(path)
	elif uri.startswith(sUrl):
		path = os.path.join(sRoot, uri.replace(sUrl, ""))
		print(path)

	else:
		return uri  # handle absolute uri (ie: http://some.tld/foo.png)

	# make sure that file exists
	if not os.path.isfile(path):
		raise Exception(
			'media URI must start with %s or %s' % (sUrl, mUrl)
		)
	return path

# CLIENTES
class ReporteClientes(LoginRequiredMixin, View):
	def get(self, request, *args, **kwargs):
		
		template_path= get_template('reportes/clientes.html')
		today = timezone.now()
		now = datetime.now()
		clientes = Clientes.objects.filter(is_staff = False)
		context = {
			'cli':clientes,
			'today':today,
			'hour': now,
			'logo': '{}'.format('static/MenuBase/img/hotel.jpeg'),
			'request':request
		}
		html = template_path.render(context)
		response = HttpResponse(content_type='application/pdf')
		
		pisaStatus = pisa.CreatePDF(
				html, dest=response, 
				link_callback=link_callback
			)
		return response
	
		return HttpResponseRedirect(reverse_lazy('reservacion:reportes'))

# RESERVACIONES
@login_required(redirect_field_name='login')
def ReporteReservacion(request, id):
	template_path= 'reportes/reservaciones.html'
	today = timezone.now()
	now = datetime.now()
	context = {
		'det': DetalleReserva.objects.filter(codigoReserva__estado = id),
		'title': id,
		'today':today,
		'hour': now,
		'logo': '{}'.format('static/MenuBase/img/hotel.jpeg'),
		'request':request
	}
	response = HttpResponse(content_type='application/pdf')
	#response['Content-Disposition'] = 'inline; filename="salida_de_vacunas.pdf"'
	template = get_template(template_path)
	html = template.render(context)

	pisaStatus = pisa.CreatePDF(html, dest=response, link_callback=link_callback)
	if pisaStatus.err:
	   return HttpResponse('We had some errors <pre>' + html + '</pre>')
	return response

# CONTAR LAS CANTIDADES DE RESERVACIONES POR HABITACION
@login_required(redirect_field_name='login')
def ReporteReservacionHabitacion(request):
	template_path= 'reportes/reserva_habitacion.html'
	today = timezone.now()
	now = datetime.now()
	data = []
	for i in Habitacion.objects.all():
		contador = DetalleReserva.objects.filter(codigoReserva__estado= 'Aprobada', habitacion = i.numeroHabitacion).count()
		data.append({'id': i, 'nro': contador, 'clase': i.clase, 'tipo': i.tipoHabitacion, 'precio': i.precio, 'desc': i.descripcion})

	context = {
		'data': data,
		'today':today,
		'hour': now,
		'logo': '{}'.format('static/MenuBase/img/hotel.jpeg'),
		'request':request
	}
	response = HttpResponse(content_type='application/pdf')
	#response['Content-Disposition'] = 'inline; filename="salida_de_vacunas.pdf"'
	template = get_template(template_path)
	html = template.render(context)

	pisaStatus = pisa.CreatePDF(html, dest=response,  link_callback=link_callback)
	if pisaStatus.err:
	   return HttpResponse('We had some errors <pre>' + html + '</pre>')
	return response

# MOSTRAR TODO POR TURNO RANGO DE FECHAS
@login_required(redirect_field_name='login')
def ReporteTurnos(request, fecha1, fecha2):
	template_path= 'reportes/todo_turnos.html'
	today = timezone.now()
	now = datetime.now()

	fecha1_f = datetime.strptime(fecha1, '%Y-%m-%d %H:%M')
	fecha2_f = datetime.strptime(fecha2, '%Y-%m-%d %H:%M')
	reservas = DetalleReserva.objects.filter(codigoReserva__estado = "Aprobada", codigoReserva__fechaReserva__gte = fecha1_f, codigoReserva__fechaReserva__lte = fecha2_f)
	ventas = Venta.objects.filter(fecha_venta__gte = fecha1_f, fecha_venta__lte = fecha2_f)

	data_habi = []
	for i in Habitacion.objects.all():
		contador = DetalleReserva.objects.filter(codigoReserva__estado= 'Aprobada', habitacion = i.numeroHabitacion, codigoReserva__fechaReserva__gte=fecha1_f, codigoReserva__fechaReserva__lte=fecha2_f).count()
		if contador > 0:
			data_habi.append({'id': i, 'nro': contador, 'clase': i.clase, 'tipo': i.tipoHabitacion, 'precio': i.precio, 'desc': i.descripcion})

	context = {
		'habi_usadas': data_habi,
		'fecha1': fecha1_f,
		'fecha2': fecha2_f,
		'reservas': reservas,
		'ventas': ventas,
		'today':today,
		'hour': now,
		'logo': '{}'.format('static/MenuBase/img/hotel.jpeg'),
		'request':request
	}
	response = HttpResponse(content_type='application/pdf')
	#response['Content-Disposition'] = 'inline; filename="salida_de_vacunas.pdf"'
	template = get_template(template_path)
	html = template.render(context)

	pisaStatus = pisa.CreatePDF(html, dest=response,  link_callback=link_callback)
	if pisaStatus.err:
	   return HttpResponse('We had some errors <pre>' + html + '</pre>')
	return response