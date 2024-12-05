from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from apps.reservacion.views import (
    Home, HomeMenu, ReservacionView, 
    ReservacionForm, HabitacionView, 
    InventarioView, ClientesView, MisReservaciones,NewAdminUser,
    NewUser, ViewPagoMovil, VentasForm, ListadoVentas, MenuReportes
)

#reportes
from apps.reservacion.reportes import ReporteClientes, ReporteReservacion, ReporteReservacionHabitacion, ReporteTurnos

app_name = 'reservacion'
urlpatterns = [
    # LandingPage
    path('', Home.as_view(), name='home'),
    # registro de clientes por la plataforma
    path('registro-de-clientes/', NewUser.as_view(), name='register'),

    
    path('inicio/', HomeMenu.as_view(), name='menu'),
    path('reservaciones/', ReservacionView.as_view(), name='reservacion'),
    path('mis-reservaciones/', MisReservaciones.as_view(), name='mi_reservacion'),
    path('nueva-reservacion/', ReservacionForm.as_view(), name='new_reservacion'),
    path('habitaciones/', HabitacionView.as_view(), name='habitacion'),
    path('inventario/', InventarioView.as_view(), name='inventario'),
    path('clientes/', ClientesView.as_view(), name='clientes'),
    path('lista-de-pagomovil/', ViewPagoMovil.as_view(), name='pago_movil'),
    path('registro-de-administradores/', NewAdminUser.as_view(), name='admin_register'),

    # ventas
    path('listado-de-venta/', ListadoVentas.as_view(), name='ventas_list'),
    path('registro-de-venta/', VentasForm.as_view(), name='ventas_form'),

    # reportes
    path('menu-de-reportes/', MenuReportes.as_view(), name='reportes'),
    path('reporte-de-clientes/', ReporteClientes.as_view(), name='re_cliente'),
    path('reporte-de-reservaciones/<str:id>/', ReporteReservacion, name='re_reservaciones'),
    path('reporte-de-reservaciones-por-habitaciones/', ReporteReservacionHabitacion, name='re_reservaciones_habi'),
    path('reporte-por-turnos/<str:fecha1>/<str:fecha2>/', ReporteTurnos, name='re_turnos'),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)