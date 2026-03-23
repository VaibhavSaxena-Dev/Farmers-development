import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  Star,
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Stethoscope,
  Building,
  Activity
} from 'lucide-react';
import { doctorApi, clinicApi, patientApi, appointmentApi } from '@/Backend/api/medicalApi';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const VALID_VET_QUALIFICATION_REGEX = /(bvsc|mvsc|b\.v\.sc|m\.v\.sc|dvm|veterinary|vety|vet\s|b\.v\.sc\.|m\.v\.sc\.|phd\s*.*vet)/i;

function isValidVetQualification(q: string): boolean {
  const t = (q || '').trim();
  if (t.length < 3) return false;
  return VALID_VET_QUALIFICATION_REGEX.test(t);
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  previousWorkPlaceName?: string;
  previousWorkPlaceDetails?: string;
  phone: string;
  email: string;
  clinicName: string;
  clinicAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  consultationFee: number;
  rating: {
    average: number;
    count: number;
  };
  isVerified: boolean;
}

interface Clinic {
  _id: string;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  rating: {
    average: number;
    count: number;
  };
}

interface Patient {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface Appointment {
  _id: string;
  title: string;
  description: string;
  scheduledDate: string;
  status: string;
  priority: string;
  consultationType: string;
  patientId: Patient;
  doctorId: Doctor;
  clinicId: Clinic;
}

const MedicalDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showClinicForm, setShowClinicForm] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [doctorFormSpecialization, setDoctorFormSpecialization] = useState('');
  const [doctorFormExperience, setDoctorFormExperience] = useState<string>('');
  const [doctorFormPreviousWorkPlace, setDoctorFormPreviousWorkPlace] = useState('');
  const [doctorFormPreviousWorkDetails, setDoctorFormPreviousWorkDetails] = useState('');
  const [doctorFormEligibilityError, setDoctorFormEligibilityError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      switch (activeTab) {
        case 'doctors':
          const doctorsData = await doctorApi.getDoctors();
          setDoctors(doctorsData.doctors || []);
          break;
        case 'clinics':
          const clinicsData = await clinicApi.getClinics();
          setClinics(clinicsData.clinics || []);
          break;
        case 'patients':
          const patientsData = await patientApi.getPatients();
          setPatients(patientsData.patients || []);
          break;
        case 'appointments':
          const appointmentsData = await appointmentApi.getAppointments();
          setAppointments(appointmentsData.appointments || []);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoadError(true);
      switch (activeTab) {
        case 'doctors': setDoctors([]); break;
        case 'clinics': setClinics([]); break;
        case 'patients': setPatients([]); break;
        case 'appointments': setAppointments([]); break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (doctorData: any) => {
    setDoctorFormEligibilityError(null);
    const name = (doctorData.name || '').trim();
    if (name.length < 2) {
      setDoctorFormEligibilityError('Please enter a valid name (at least 2 characters).');
      toast.error('Please enter a valid name.');
      return;
    }
    const qualification = (doctorData.qualification || '').trim();
    if (!qualification) {
      setDoctorFormEligibilityError('Please enter your veterinary qualification (e.g. BVSc, MVSc, DVM).');
      toast.error('Qualification is required.');
      return;
    }
    if (!isValidVetQualification(qualification)) {
      setDoctorFormEligibilityError('You are not eligible for that. Please enter a valid veterinary qualification (e.g. BVSc, MVSc, DVM).');
      toast.error('Please enter a valid veterinary qualification (e.g. BVSc, MVSc, DVM).');
      return;
    }
    const clinicName = (doctorData.clinicName || '').trim();
    if (clinicName.length < 3) {
      setDoctorFormEligibilityError('Please enter a valid veterinary clinic or hospital name (at least 3 characters).');
      toast.error('Please enter a valid clinic name.');
      return;
    }
    const exp = typeof doctorData.experience === 'number' ? doctorData.experience : parseInt(String(doctorData.experience), 10);
    if (Number.isNaN(exp) || exp < 0) {
      setDoctorFormEligibilityError('You are not eligible for that. Experience must be 0 or more years.');
      toast.error('You are not eligible for that. Please enter a valid experience (0 or more years).');
      return;
    }
    if (exp > 0) {
      const prevWork = (doctorData.previousWorkPlaceName || '').trim();
      if (prevWork.length < 3) {
        setDoctorFormEligibilityError('Where did you work previously? Please provide a valid previous workplace name (at least 3 characters).');
        toast.error('Please enter where you worked previously (at least 3 characters).');
        return;
      }
    }
    try {
      await doctorApi.createDoctor(doctorData);
      toast.success('Veterinary doctor registered successfully');
      setShowDoctorForm(false);
      setDoctorFormExperience('');
      setDoctorFormPreviousWorkPlace('');
      setDoctorFormPreviousWorkDetails('');
      setDoctorFormSpecialization('');
      setDoctorFormEligibilityError(null);
      if (activeTab === 'doctors') {
        loadData();
      }
    } catch (error: unknown) {
      console.error('Failed to create doctor:', error);
      const msg = error instanceof Error ? error.message : 'Failed to create doctor';
      setDoctorFormEligibilityError(msg);
      toast.error(msg);
    }
  };

  const handleCreateClinic = async (clinicData: any) => {
    try {
      await clinicApi.createClinic(clinicData);
      toast.success('Clinic created successfully');
      setShowClinicForm(false);
      if (activeTab === 'clinics') {
        loadData();
      }
    } catch (error) {
      console.error('Failed to create clinic:', error);
      toast.error('Failed to create clinic');
    }
  };

  const handleCreatePatient = async (patientData: any) => {
    try {
      await patientApi.createPatient(patientData);
      toast.success('Patient created successfully');
      setShowPatientForm(false);
      if (activeTab === 'patients') {
        loadData();
      }
    } catch (error) {
      console.error('Failed to create patient:', error);
      toast.error('Failed to create patient');
    }
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      await appointmentApi.createAppointment(appointmentData);
      toast.success('Appointment created successfully');
      setShowAppointmentForm(false);
      if (activeTab === 'appointments') {
        loadData();
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handleConfirmAppointment = async (id: string) => {
    try {
      await appointmentApi.confirmAppointment(id);
      toast.success('Appointment confirmed successfully');
      loadData();
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      toast.error('Failed to confirm appointment');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const reason = prompt('Please enter the reason for cancellation:');
      if (reason) {
        await appointmentApi.cancelAppointment(id, reason);
        toast.success('Appointment cancelled successfully');
        loadData();
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-yellow';
      case 'Confirmed': return 'bg-green';
      case 'In Progress': return 'bg-blue';
      case 'Completed': return 'bg-gray';
      case 'Cancelled': return 'bg-red';
      case 'No Show': return 'bg-orange';
      default: return 'bg-gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red';
      case 'High': return 'text-orange';
      case 'Medium': return 'text-yellow';
      case 'Low': return 'text-green';
      default: return 'text-gray';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('vetDoctors') || 'Veterinary Doctors'}</h1>
        <p className="text-muted-foreground">{t('vetDoctorsDesc') || 'Manage veterinary doctors, clinics, and appointments — livestock, poultry & animal care only'}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            {t('vetDoctors') || 'Vet Doctors'}
            <Badge variant="secondary" className="ml-2">
              {doctors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="clinics" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {t('vetClinics') || 'Vet Clinics'}
            <Badge variant="secondary" className="ml-2">
              {clinics.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('patients') || 'Patients'}
            <Badge variant="secondary" className="ml-2">
              {patients.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('appointments') || 'Appointments'}
            <Badge variant="secondary" className="ml-2">
              {appointments.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          {loadError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              {t('loadErrorMsg')}
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder={t('searchVetDoctors')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button onClick={() => setShowDoctorForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addVetDoctor')}
            </Button>
          </div>

          {showDoctorForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('addNewVetDoctor')}</CardTitle>
              </CardHeader>
              <CardContent>
                {doctorFormEligibilityError && (
                  <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {doctorFormEligibilityError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('vetName')}</Label>
                    <Input id="name" placeholder={t('vetNamePlaceholder')} />
                  </div>
                  <div>
                    <Label htmlFor="specialization">{t('vetSpecialization')}</Label>
                    <Select value={doctorFormSpecialization} onValueChange={setDoctorFormSpecialization}>
                      <SelectTrigger id="specialization">
                        <SelectValue placeholder={t('vetSpecializationPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Livestock & Cattle">Livestock & Cattle</SelectItem>
                        <SelectItem value="Poultry">Poultry</SelectItem>
                        <SelectItem value="Small Animals">Small Animals</SelectItem>
                        <SelectItem value="Equine">Equine</SelectItem>
                        <SelectItem value="Wildlife">Wildlife</SelectItem>
                        <SelectItem value="Veterinary Surgeon">Veterinary Surgeon</SelectItem>
                        <SelectItem value="Dairy Animal Health">Dairy Animal Health</SelectItem>
                        <SelectItem value="Poultry Disease Specialist">Poultry Disease Specialist</SelectItem>
                        <SelectItem value="Rural Veterinary Practice">Rural Veterinary Practice</SelectItem>
                        <SelectItem value="Veterinary Public Health">Veterinary Public Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('vetPhone')}</Label>
                    <Input id="phone" placeholder={t('vetPhonePlaceholder')} />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('vetEmail')}</Label>
                    <Input id="email" type="email" placeholder={t('vetEmailPlaceholder')} />
                  </div>
                  <div>
                    <Label htmlFor="clinicName">{t('vetClinicName')}</Label>
                    <Input id="clinicName" placeholder={t('vetClinicNamePlaceholder')} />
                  </div>
                  <div>
                    <Label htmlFor="qualification">{t('vetQualification')}</Label>
                    <Input id="qualification" placeholder={t('vetQualificationPlaceholder')} />
                  </div>
                  <div>
                    <Label htmlFor="experience">{t('vetExperience')}</Label>
                    <Input
                      id="experience"
                      type="number"
                      min={0}
                      placeholder={t('vetExperiencePlaceholder')}
                      value={doctorFormExperience}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDoctorFormExperience(v);
                        if (v === '' || parseInt(v, 10) < 0) setDoctorFormEligibilityError(null);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultationFee">{t('vetConsultationFee')}</Label>
                    <Input id="consultationFee" type="number" min={0} placeholder={t('vetConsultationFeePlaceholder')} />
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground mb-3">{t('vetClinicLocation')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clinicCity">{t('vetCity')}</Label>
                      <Input id="clinicCity" placeholder={t('vetCity')} />
                    </div>
                    <div>
                      <Label htmlFor="clinicState">{t('vetState')}</Label>
                      <Input id="clinicState" placeholder={t('vetState')} />
                    </div>
                    <div>
                      <Label htmlFor="clinicPincode">{t('vetPincode')}</Label>
                      <Input id="clinicPincode" placeholder={t('vetPincode')} />
                    </div>
                    <div>
                      <Label htmlFor="clinicLat">{t('vetLatitude')}</Label>
                      <Input id="clinicLat" type="number" step="any" placeholder="e.g. 12.97" />
                    </div>
                    <div>
                      <Label htmlFor="clinicLng">{t('vetLongitude')}</Label>
                      <Input id="clinicLng" type="number" step="any" placeholder="e.g. 77.59" />
                    </div>
                  </div>
                </div>
                {doctorFormExperience !== '' && parseInt(doctorFormExperience, 10) > 0 && (
                  <div className="mt-4 space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-foreground">{t('vetPreviousWorkplace')}</p>
                    <div>
                      <Label htmlFor="previousWorkPlace">{t('vetPreviousWorkplaceLabel')}</Label>
                      <Input
                        id="previousWorkPlace"
                        placeholder={t('vetPreviousWorkplacePlaceholder')}
                        value={doctorFormPreviousWorkPlace}
                        onChange={(e) => setDoctorFormPreviousWorkPlace(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="previousWorkDetails">{t('vetPreviousWorkplaceDetails')}</Label>
                      <Textarea
                        id="previousWorkDetails"
                        placeholder={t('vetPreviousWorkplaceDetailsPlaceholder')}
                        value={doctorFormPreviousWorkDetails}
                        onChange={(e) => setDoctorFormPreviousWorkDetails(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <Label htmlFor="about">{t('vetAbout')}</Label>
                  <Textarea id="about" placeholder={t('vetAboutPlaceholder')} />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => {
                    setShowDoctorForm(false);
                    setDoctorFormEligibilityError(null);
                    setDoctorFormExperience('');
                    setDoctorFormPreviousWorkPlace('');
                    setDoctorFormPreviousWorkDetails('');
                    setDoctorFormSpecialization('');
                  }}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={() => {
                    const expVal = doctorFormExperience === '' ? NaN : parseInt(doctorFormExperience, 10);
                    const clinicName = (document.getElementById('clinicName') as HTMLInputElement)?.value?.trim() ?? '';
                    const lat = parseFloat((document.getElementById('clinicLat') as HTMLInputElement)?.value || '');
                    const lng = parseFloat((document.getElementById('clinicLng') as HTMLInputElement)?.value || '');
                    const formData = {
                      name: (document.getElementById('name') as HTMLInputElement)?.value?.trim() ?? '',
                      specialization: doctorFormSpecialization,
                      phone: (document.getElementById('phone') as HTMLInputElement)?.value?.trim() ?? '',
                      email: (document.getElementById('email') as HTMLInputElement)?.value?.trim() ?? '',
                      clinicName,
                      qualification: (document.getElementById('qualification') as HTMLInputElement)?.value?.trim() ?? '',
                      experience: expVal,
                      consultationFee: Math.max(0, parseFloat((document.getElementById('consultationFee') as HTMLInputElement)?.value || '0') || 0),
                      about: (document.getElementById('about') as HTMLTextAreaElement)?.value?.trim() ?? '',
                      previousWorkPlaceName: doctorFormPreviousWorkPlace.trim() || undefined,
                      previousWorkPlaceDetails: doctorFormPreviousWorkDetails.trim() || undefined,
                      clinicAddress: {
                        street: clinicName,
                        city: (document.getElementById('clinicCity') as HTMLInputElement)?.value?.trim() ?? '',
                        state: (document.getElementById('clinicState') as HTMLInputElement)?.value?.trim() ?? '',
                        pincode: (document.getElementById('clinicPincode') as HTMLInputElement)?.value?.trim() ?? '',
                        coordinates: (Number.isFinite(lat) && Number.isFinite(lng)) ? { latitude: lat, longitude: lng } : undefined,
                      },
                    };
                    handleCreateDoctor(formData);
                  }}>
                    {t('vetRegisterBtn')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Activity className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-gray-600 mt-2">{t('vetLoadingDoctors')}</p>
              </div>
            ) : (
              doctors.map((doctor) => (
                <Card key={doctor._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        <p className="text-xs text-gray-500">{doctor.qualification}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doctor.isVerified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {t('vetVerified')}
                          </Badge>
                        )}
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm">
                            {doctor.rating.average.toFixed(1)} ({doctor.rating.count})
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{doctor.phone}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{doctor.email}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {doctor.clinicAddress.street}, {doctor.clinicAddress.city}, {doctor.clinicAddress.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {typeof doctor.experience === 'number' && doctor.experience >= 0
                            ? t('vetYearsExp', { exp: doctor.experience })
                            : '—'}
                        </span>
                      </div>
                      {doctor.previousWorkPlaceName && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">{t('vetPreviousWorkplaceCard')}</span>
                          <span className="text-sm">{doctor.previousWorkPlaceName}</span>
                          {doctor.previousWorkPlaceDetails && (
                            <span className="text-xs text-muted-foreground">{doctor.previousWorkPlaceDetails}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{t('vetConsultationFeeLabel')}</span>
                        <span className="text-sm font-bold">
                          {typeof doctor.consultationFee === 'number' && doctor.consultationFee >= 0
                            ? `₹${doctor.consultationFee}`
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="clinics">
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4" />
            <p>{t('vetClinicsComingSoon')}</p>
          </div>
        </TabsContent>

        <TabsContent value="patients">
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p>{t('vetPatientsComingSoon')}</p>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>{t('vetAppointmentsComingSoon')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalDashboard;
