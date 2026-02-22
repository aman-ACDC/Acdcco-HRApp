from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Person
from .serializers import PersonSerializer
from .permissions import IsReadOnlyOrAbove, IsReadWriteOrAbove, IsFullAccessUser


class PersonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Person (Employee) records

    SECURITY: Role-Based Access Control (RBAC) enforced

    Permission Levels:
    - READ (GET):    HR_ReadOnly, HR_ReadWrite, HR_FullAccess, Superuser
    - WRITE (POST/PATCH): HR_ReadWrite, HR_FullAccess, Superuser
    - DELETE:        HR_FullAccess, Superuser ONLY

    Standard endpoints:
    - GET    /api/employees/           - List all employees (READ permission)
    - POST   /api/employees/           - Create new employee (WRITE permission)
    - GET    /api/employees/{id}/      - Get employee by ID (READ permission)
    - PUT    /api/employees/{id}/      - Update employee full (WRITE permission)
    - PATCH  /api/employees/{id}/      - Update employee partial (WRITE permission)
    - DELETE /api/employees/{id}/      - Delete employee by ID (DELETE permission)

    Custom endpoints:
    - GET    /api/employees/filter_employees/      - Filter by department/status (READ)
    - DELETE /api/employees/delete_by_identifier/  - Delete by email or name (DELETE)
    - PATCH  /api/employees/update_by_identifier/  - Update by email or name (WRITE)
    - PATCH  /api/employees/{id}/set_portal_account/ - Set portal credentials (WRITE)
    """
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    # Default permission (fallback)
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        """

        # READ operations - Any HR role can view
        if self.action in ['list', 'retrieve', 'by_department']:
            permission_classes = [IsAuthenticated]

        # WRITE operations - ReadWrite and FullAccess can create/update
        elif self.action in ['create', 'update', 'partial_update', 'update_by_identifier', 'set_portal_account']:
            permission_classes = [IsReadWriteOrAbove]

        # DELETE operations - Only FullAccess can delete
        elif self.action in ['destroy', 'delete_by_identifier']:
            permission_classes = [IsFullAccessUser]

        # Default fallback - require authentication
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], url_path='filter_employees')
    def by_department(self, request):
        department = request.query_params.get('department')
        status_filter = request.query_params.get('status')

        employees = Person.objects.all()

        if department:
            employees = employees.filter(department=department)

        if status_filter:
            employees = employees.filter(status=status_filter)

        if not department and not status_filter:
            return Response(
                {"error": "Please provide at least one filter: department or status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def delete_by_identifier(self, request):
        email = request.query_params.get('email')
        full_name = request.query_params.get('full_name')

        if not email and not full_name:
            return Response(
                {"error": "Either email or full_name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if email:
            person = get_object_or_404(Person, acdc_email__iexact=email)
            deleted_name = person.full_name
            person.delete()
            return Response(
                {
                    "message": f"Employee {deleted_name} with email {email} deleted successfully",
                    "deleted_by": request.user.username
                },
                status=status.HTTP_200_OK
            )

        if full_name:
            matching_people = Person.objects.filter(full_name__iexact=full_name)

            if matching_people.count() == 0:
                return Response(
                    {"error": f"No employee found with name '{full_name}'"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if matching_people.count() > 1:
                matches = [
                    {
                        "full_name": p.full_name,
                        "email": p.acdc_email,
                        "department": p.department,
                        "position": p.position
                    }
                    for p in matching_people
                ]
                return Response(
                    {
                        "error": f"Multiple employees found with name '{full_name}'. Please use email instead.",
                        "matches": matches
                    },
                    status=status.HTTP_409_CONFLICT
                )

            person = matching_people.first()
            deleted_name = person.full_name
            deleted_email = person.acdc_email
            person.delete()

            return Response(
                {
                    "message": f"Employee {deleted_name} ({deleted_email}) deleted successfully",
                    "deleted_by": request.user.username
                },
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['patch'])
    def update_by_identifier(self, request):
        email = request.query_params.get('email')
        full_name = request.query_params.get('full_name')

        if not email and not full_name:
            return Response(
                {"error": "Either email or full_name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if email:
            person = get_object_or_404(Person, acdc_email__iexact=email)
            serializer = self.get_serializer(person, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": f"Employee {email} updated successfully",
                    "updated_by": request.user.username,
                    "updated_data": serializer.data
                })

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if full_name:
            matching_people = Person.objects.filter(full_name__iexact=full_name)

            if matching_people.count() == 0:
                return Response(
                    {"error": f"No employee found with name '{full_name}'"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if matching_people.count() > 1:
                matches = [
                    {
                        "full_name": p.full_name,
                        "email": p.acdc_email,
                        "department": p.department,
                        "position": p.position
                    }
                    for p in matching_people
                ]
                return Response(
                    {
                        "error": f"Multiple employees found with name '{full_name}'. Please use email instead.",
                        "matches": matches
                    },
                    status=status.HTTP_409_CONFLICT
                )

            person = matching_people.first()
            serializer = self.get_serializer(person, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": f"Employee {full_name} updated successfully",
                    "updated_by": request.user.username,
                    "updated_data": serializer.data
                })

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["patch"], url_path="set_portal_account")
    def set_portal_account(self, request, pk=None):
        person = self.get_object()

        portal_email = request.data.get("portal_email")
        portal_password = request.data.get("portal_password")
        portal_role = request.data.get("portal_role")

        if portal_email is not None:
            person.portal_email = portal_email
        if portal_password is not None:
            person.portal_password = portal_password
        if portal_role is not None:
            person.portal_role = portal_role

        person.save()
        serializer = self.get_serializer(person)
        return Response(serializer.data, status=status.HTTP_200_OK)
