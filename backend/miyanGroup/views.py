from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from core.viewsets import AdminWritePermissionMixin
from . import models, serializers


class MiyanGalleryViewSet(AdminWritePermissionMixin, viewsets.ModelViewSet):
    queryset = models.MiyanGallery.objects.all().order_by('order')
    serializer_class = serializers.MiyanGallerySerializer


class BranchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Branch.objects.filter(is_active=True)
    serializer_class = serializers.BranchSerializer
    permission_classes = [permissions.AllowAny]


class StaffViewSet(AdminWritePermissionMixin, viewsets.ModelViewSet):
    queryset = models.Staff.objects.select_related('user').all()
    serializer_class = serializers.StaffSerializer
    admin_write_actions = {'create', 'update', 'partial_update', 'destroy', 'register'}
    read_permission_class = permissions.IsAdminUser
    write_permission_class = permissions.IsAdminUser

    @action(detail=False, methods=['post'], url_path='register', permission_classes=[permissions.IsAdminUser])
    def register(self, request):
        serializer = serializers.StaffRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff = serializer.save()
        return Response(serializers.StaffSerializer(staff).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='me', permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            staff = request.user.staff_profile
        except models.Staff.DoesNotExist:
            return Response({'detail': 'Staff profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializers.StaffSerializer(staff).data)


class StaffAssignmentViewSet(AdminWritePermissionMixin, viewsets.ModelViewSet):
    serializer_class = serializers.StaffBranchAssignmentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        staff_id = self.request.query_params.get('staff_id')
        queryset = models.StaffBranchAssignment.objects.select_related('branch', 'staff')
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        return queryset


class StaffShiftViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StaffShiftSerializer

    def get_staff(self):
        try:
            return self.request.user.staff_profile
        except models.Staff.DoesNotExist:
            return None

    @action(detail=False, methods=['get'])
    def current(self, request):
        staff = self.get_staff()
        if not staff:
            return Response({'detail': 'Staff profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        shift = staff.active_shift
        if not shift:
            return Response({'active': False})
        data = serializers.StaffShiftSerializer(shift).data
        data['active'] = True
        return Response(data)

    @action(detail=False, methods=['post'])
    def start(self, request):
        staff = self.get_staff()
        if not staff:
            return Response({'detail': 'Staff profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = serializers.StartShiftSerializer(
            data=request.data,
            context={'staff': staff},
        )
        serializer.is_valid(raise_exception=True)
        shift = serializer.save()
        return Response(serializers.StaffShiftSerializer(shift).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def end(self, request):
        staff = self.get_staff()
        if not staff:
            return Response({'detail': 'Staff profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = serializers.EndShiftSerializer(context={'staff': staff}, data={})
        serializer.is_valid(raise_exception=True)
        shift = serializer.save()
        return Response(serializers.StaffShiftSerializer(shift).data)


class InventoryItemViewSet(AdminWritePermissionMixin, viewsets.ModelViewSet):
    queryset = models.InventoryItem.objects.select_related('branch').all()
    serializer_class = serializers.InventoryItemSerializer
    admin_write_actions = {'create', 'update', 'partial_update', 'destroy'}
    read_permission_class = permissions.IsAuthenticated
    write_permission_class = permissions.IsAdminUser

    def get_queryset(self):
        queryset = super().get_queryset().filter(branch__is_active=True)
        branch_id = self.request.query_params.get('branch')
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        elif self.request.user.is_authenticated:
            try:
                staff = self.request.user.staff_profile
                active_branch = staff.active_shift.branch if staff.active_shift else None
                if active_branch:
                    queryset = queryset.filter(branch=active_branch)
            except models.Staff.DoesNotExist:
                pass
        return queryset


class InventoryMeasurementViewSet(viewsets.ModelViewSet):
    queryset = models.InventoryMeasurement.objects.select_related('branch', 'item').all()
    serializer_class = serializers.InventoryMeasurementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        staff = self._get_staff_or_error()
        try:
            branch = self._resolve_branch(serializer.validated_data.get('item'), staff)
        except ValueError as exc:
            raise PermissionDenied(str(exc))
        serializer.save(recorded_by=staff, branch=branch)

    def _resolve_branch(self, item, staff):
        if item:
            return item.branch
        active_shift = staff.active_shift
        if active_shift:
            return active_shift.branch
        raise ValueError('Branch could not be determined.')

    def _get_staff_or_error(self):
        try:
            return self.request.user.staff_profile
        except models.Staff.DoesNotExist:
            raise PermissionDenied('Staff profile required')


class InventoryInputViewSet(viewsets.ModelViewSet):
    queryset = models.InventoryInput.objects.select_related('branch', 'item').all()
    serializer_class = serializers.InventoryInputSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        staff = self._get_staff_or_error()
        item = serializer.validated_data.get('item')
        try:
            branch = self._resolve_branch(item, staff)
        except ValueError as exc:
            raise PermissionDenied(str(exc))
        serializer.save(recorded_by=staff, branch=branch)

    def _resolve_branch(self, item, staff):
        if item:
            return item.branch
        active_shift = staff.active_shift
        if active_shift:
            return active_shift.branch
        raise ValueError('Branch could not be determined.')

    def _get_staff_or_error(self):
        try:
            return self.request.user.staff_profile
        except models.Staff.DoesNotExist:
            raise PermissionDenied('Staff profile required')
