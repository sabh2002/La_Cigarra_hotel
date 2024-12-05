from django.contrib import admin

# Register your models here.
from apps.reservacion.models import Reserva, DetalleReserva, Clientes, Habitacion, Productos, PrecioDolar,DatosPagoMovil, Venta, DetVenta

admin.site.register(Reserva)
admin.site.register(DetalleReserva)
admin.site.register(Clientes)
admin.site.register(Habitacion) 
admin.site.register(Productos)
admin.site.register(PrecioDolar)
admin.site.register(DatosPagoMovil)
admin.site.register(Venta)
admin.site.register(DetVenta)