import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  Application,
  ApplicationEvent,
  ApplicationStatus,
  AuditLog,
  ConsentRecord,
  DataConflict,
  EligibilityResult,
  NormalizedProfile,
  Service,
  DataSource,
} from '@/lib/types';
import {
  mockServices,
  mockApiRegistry,
  mockApplications,
  mockApplicationEvents,
  mockConsentRecords,
  mockAuditLogs,
} from '@/lib/mockApi/staticData';

// ============== Services ==============

export async function fetchServices(): Promise<Service[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockServices.filter((s) => s.is_active);
  }
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data || []) as Service[];
}

export async function fetchServiceById(id: string): Promise<Service | null> {
  if (!isSupabaseConfigured || !supabase) {
    return mockServices.find((s) => s.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Service | null;
}

// ============== Applications ==============

export async function fetchApplications(citizenId: string): Promise<Application[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockApplications
      .filter((a) => a.citizen_id === citizenId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('citizen_id', citizenId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Application[];
}

export async function fetchAllApplications(): Promise<Application[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [...mockApplications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Application[];
}

export async function fetchApplicationById(id: string): Promise<Application | null> {
  if (!isSupabaseConfigured || !supabase) {
    return mockApplications.find((a) => a.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Application | null;
}

export async function createApplication(
  serviceId: string,
  citizenId: string,
  citizenName: string,
): Promise<Application> {
  if (!isSupabaseConfigured || !supabase) {
    const now = new Date().toISOString();
    const app: Application = {
      id: crypto.randomUUID(),
      service_id: serviceId,
      citizen_id: citizenId,
      citizen_name: citizenName,
      status: 'draft',
      eligibility_result: null,
      normalized_data: null,
      conflicts: [],
      submitted_at: null,
      created_at: now,
      updated_at: now,
    };
    mockApplications.push(app);
    return app;
  }
  const { data, error } = await supabase
    .from('applications')
    .insert({
      service_id: serviceId,
      citizen_id: citizenId,
      citizen_name: citizenName,
      status: 'draft',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Application;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  extra?: {
    eligibility_result?: EligibilityResult;
    normalized_data?: NormalizedProfile;
    conflicts?: DataConflict[];
    submitted_at?: string;
  },
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const app = mockApplications.find((a) => a.id === id);
    if (app) {
      app.status = status;
      app.updated_at = new Date().toISOString();
      if (extra?.eligibility_result) app.eligibility_result = extra.eligibility_result;
      if (extra?.normalized_data) app.normalized_data = extra.normalized_data;
      if (extra?.conflicts) app.conflicts = extra.conflicts;
      if (extra?.submitted_at) app.submitted_at = extra.submitted_at;
    }
    return;
  }
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq('id', id);
  if (error) throw error;
}

// ============== Application Events ==============

export async function fetchApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockApplicationEvents
      .filter((e) => e.application_id === applicationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  const { data, error } = await supabase
    .from('application_events')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as ApplicationEvent[];
}

export async function addApplicationEvent(
  applicationId: string,
  eventType: string,
  title: string,
  description: string | null,
  status: string | null,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    mockApplicationEvents.push({
      id: crypto.randomUUID(),
      application_id: applicationId,
      event_type: eventType,
      title,
      description,
      status,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });
    return;
  }
  const { error } = await supabase.from('application_events').insert({
    application_id: applicationId,
    event_type: eventType,
    title,
    description,
    status,
    metadata: metadata || {},
  });
  if (error) throw error;
}

// ============== Consent ==============

export async function fetchConsentRecords(citizenId: string): Promise<ConsentRecord[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockConsentRecords
      .filter((r: any) => r.citizen_id === citizenId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .eq('citizen_id', citizenId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ConsentRecord[];
}

export async function createConsentRecord(
  applicationId: string,
  citizenId: string,
  serviceId: string,
  dataSources: DataSource[],
  fieldsAccessed: { source: DataSource; fields: string[]; reason: string }[],
  granted: boolean,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    mockConsentRecords.push({
      id: crypto.randomUUID(),
      application_id: applicationId,
      citizen_id: citizenId,
      service_id: serviceId,
      data_sources: dataSources,
      fields_accessed: fieldsAccessed,
      granted,
      created_at: new Date().toISOString(),
    });
    return;
  }
  const { error } = await supabase.from('consent_records').insert({
    application_id: applicationId,
    citizen_id: citizenId,
    service_id: serviceId,
    data_sources: dataSources,
    fields_accessed: fieldsAccessed,
    granted,
  });
  if (error) throw error;
}

export async function fetchAllConsentRecords(): Promise<ConsentRecord[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [...mockConsentRecords].sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ConsentRecord[];
}

// ============== Audit Logs ==============

export async function fetchAuditLogs(limit = 100): Promise<AuditLog[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [...mockAuditLogs]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as AuditLog[];
}

export async function addAuditLog(
  actorId: string,
  actorRole: 'citizen' | 'admin' | 'system',
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    mockAuditLogs.push({
      id: crypto.randomUUID(),
      actor_id: actorId,
      actor_role: actorRole,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || {},
      created_at: new Date().toISOString(),
    });
    return;
  }
  const { error } = await supabase.from('audit_logs').insert({
    actor_id: actorId,
    actor_role: actorRole,
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    details: details || {},
  });
  if (error) throw error;
}

// ============== API Registry ==============

export async function fetchApiRegistry() {
  if (!isSupabaseConfigured || !supabase) {
    return mockApiRegistry;
  }
  const { data, error } = await supabase
    .from('api_registry')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}
