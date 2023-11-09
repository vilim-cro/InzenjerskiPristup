from rest_framework import permissions

class PripadaDirektorima(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Direktori')
    
class PripadaRevizorima(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Revizori')
    
class PripadaRačunovođama(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Računovođe')