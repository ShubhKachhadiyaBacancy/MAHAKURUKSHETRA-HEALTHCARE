export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_name: string;
          id: string;
          metadata: Json;
          organization_id: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_name: string;
          id?: string;
          metadata?: Json;
          organization_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
      case_managers: {
        Row: {
          active: boolean;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          organization_id: string;
          phone: string | null;
          profile_id: string | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          organization_id: string;
          phone?: string | null;
          profile_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["case_managers"]["Insert"]>;
      };
      claims: {
        Row: {
          amount: number | null;
          case_id: string | null;
          claim_number: string;
          claim_type: "medical" | "pharmacy" | "reimbursement" | "support";
          created_at: string;
          id: string;
          note: string | null;
          organization_id: string;
          patient_id: string;
          payer_name: string | null;
          service_date: string | null;
          status:
            | "draft"
            | "submitted"
            | "in_review"
            | "approved"
            | "partially_approved"
            | "denied"
            | "paid";
          updated_at: string;
        };
        Insert: {
          amount?: number | null;
          case_id?: string | null;
          claim_number: string;
          claim_type?: "medical" | "pharmacy" | "reimbursement" | "support";
          created_at?: string;
          id?: string;
          note?: string | null;
          organization_id: string;
          patient_id: string;
          payer_name?: string | null;
          service_date?: string | null;
          status?:
            | "draft"
            | "submitted"
            | "in_review"
            | "approved"
            | "partially_approved"
            | "denied"
            | "paid";
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["claims"]["Insert"]>;
      };
      communications: {
        Row: {
          case_id: string | null;
          channel: "sms" | "email" | "call" | "portal";
          created_at: string;
          created_by: string | null;
          direction: "inbound" | "outbound";
          id: string;
          organization_id: string;
          recipient_type: "patient" | "provider" | "payer" | "pharmacy" | "manufacturer";
          scheduled_for: string | null;
          status: "scheduled" | "sent" | "completed" | "failed" | "received";
          summary: string;
        };
        Insert: {
          case_id?: string | null;
          channel: "sms" | "email" | "call" | "portal";
          created_at?: string;
          created_by?: string | null;
          direction: "inbound" | "outbound";
          id?: string;
          organization_id: string;
          recipient_type: "patient" | "provider" | "payer" | "pharmacy" | "manufacturer";
          scheduled_for?: string | null;
          status?: "scheduled" | "sent" | "completed" | "failed" | "received";
          summary: string;
        };
        Update: Partial<Database["public"]["Tables"]["communications"]["Insert"]>;
      };
      documents: {
        Row: {
          case_id: string | null;
          category: "insurance" | "clinical" | "authorization" | "consent" | "appeal" | "other";
          created_at: string;
          id: string;
          mime_type: string | null;
          organization_id: string;
          storage_path: string | null;
          title: string;
          updated_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          case_id?: string | null;
          category: "insurance" | "clinical" | "authorization" | "consent" | "appeal" | "other";
          created_at?: string;
          id?: string;
          mime_type?: string | null;
          organization_id: string;
          storage_path?: string | null;
          title: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      financial_assistance_cases: {
        Row: {
          case_id: string;
          created_at: string;
          estimated_monthly_savings: number | null;
          household_income_band: string | null;
          id: string;
          notes: string | null;
          organization_id: string;
          program_name: string | null;
          program_type: "copay" | "pap" | "foundation" | "bridge";
          status: "screening" | "submitted" | "active" | "denied" | "expired" | "closed";
          updated_at: string;
        };
        Insert: {
          case_id: string;
          created_at?: string;
          estimated_monthly_savings?: number | null;
          household_income_band?: string | null;
          id?: string;
          notes?: string | null;
          organization_id: string;
          program_name?: string | null;
          program_type: "copay" | "pap" | "foundation" | "bridge";
          status?: "screening" | "submitted" | "active" | "denied" | "expired" | "closed";
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["financial_assistance_cases"]["Insert"]
        >;
      };
      insurance_policies: {
        Row: {
          bin: string | null;
          created_at: string;
          group_number: string | null;
          id: string;
          member_id: string;
          organization_id: string;
          patient_id: string;
          payer_name: string;
          pcn: string | null;
          plan_name: string | null;
          status: "pending" | "verified" | "active" | "denied";
          updated_at: string;
          verification_notes: string | null;
        };
        Insert: {
          bin?: string | null;
          created_at?: string;
          group_number?: string | null;
          id?: string;
          member_id: string;
          organization_id: string;
          patient_id: string;
          payer_name: string;
          pcn?: string | null;
          plan_name?: string | null;
          status?: "pending" | "verified" | "active" | "denied";
          updated_at?: string;
          verification_notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["insurance_policies"]["Insert"]>;
      };
      medications: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          manufacturer: string | null;
          name: string;
          requires_cold_chain: boolean;
          requires_prior_auth: boolean;
          support_program: string | null;
          therapy_area: string | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          manufacturer?: string | null;
          name: string;
          requires_cold_chain?: boolean;
          requires_prior_auth?: boolean;
          support_program?: string | null;
          therapy_area?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["medications"]["Insert"]>;
      };
      notifications: {
        Row: {
          action_url: string | null;
          body: string;
          case_id: string | null;
          created_at: string;
          id: string;
          organization_id: string;
          priority: "info" | "watch" | "critical";
          profile_id: string | null;
          read_at: string | null;
          title: string;
        };
        Insert: {
          action_url?: string | null;
          body: string;
          case_id?: string | null;
          created_at?: string;
          id?: string;
          organization_id: string;
          priority?: "info" | "watch" | "critical";
          profile_id?: string | null;
          read_at?: string | null;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      offices: {
        Row: {
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          organization_id: string;
          phone: string | null;
          state: string | null;
          updated_at: string;
          zip_code: string | null;
        };
        Insert: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          phone?: string | null;
          state?: string | null;
          updated_at?: string;
          zip_code?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["offices"]["Insert"]>;
      };
      patient_cases: {
        Row: {
          barrier_summary: string | null;
          case_manager_id: string | null;
          created_at: string;
          id: string;
          insurance_policy_id: string | null;
          last_activity_at: string;
          next_action: string | null;
          next_action_due_at: string | null;
          organization_id: string;
          owner_profile_id: string | null;
          patient_id: string;
          prescription_id: string | null;
          priority: "routine" | "watch" | "critical";
          provider_id: string | null;
          status:
            | "intake"
            | "benefit_verification"
            | "prior_auth"
            | "financial_assistance"
            | "pharmacy_coordination"
            | "ready_to_start"
            | "on_therapy"
            | "blocked";
          therapy_start_target: string | null;
          updated_at: string;
        };
        Insert: {
          barrier_summary?: string | null;
          case_manager_id?: string | null;
          created_at?: string;
          id?: string;
          insurance_policy_id?: string | null;
          last_activity_at?: string;
          next_action?: string | null;
          next_action_due_at?: string | null;
          organization_id: string;
          owner_profile_id?: string | null;
          patient_id: string;
          prescription_id?: string | null;
          priority?: "routine" | "watch" | "critical";
          provider_id?: string | null;
          status?:
            | "intake"
            | "benefit_verification"
            | "prior_auth"
            | "financial_assistance"
            | "pharmacy_coordination"
            | "ready_to_start"
            | "on_therapy"
            | "blocked";
          therapy_start_target?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["patient_cases"]["Insert"]>;
      };
      patients: {
        Row: {
          city: string | null;
          consent_status: "pending" | "received" | "declined";
          created_at: string;
          date_of_birth: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          organization_id: string;
          phone: string | null;
          preferred_channel: "sms" | "email" | "call" | "portal";
          profile_id: string | null;
          sex: "female" | "male" | "non_binary" | "unknown";
          state: string | null;
          updated_at: string;
          zip_code: string | null;
        };
        Insert: {
          city?: string | null;
          consent_status?: "pending" | "received" | "declined";
          created_at?: string;
          date_of_birth?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          organization_id: string;
          phone?: string | null;
          preferred_channel?: "sms" | "email" | "call" | "portal";
          profile_id?: string | null;
          sex?: "female" | "male" | "non_binary" | "unknown";
          state?: string | null;
          updated_at?: string;
          zip_code?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
      };
      prescriptions: {
        Row: {
          clinical_notes: string | null;
          created_at: string;
          diagnosis: string | null;
          dosage: string | null;
          frequency: string | null;
          id: string;
          medication_id: string;
          organization_id: string;
          patient_id: string;
          provider_id: string;
          quantity: number | null;
          updated_at: string;
          written_at: string | null;
        };
        Insert: {
          clinical_notes?: string | null;
          created_at?: string;
          diagnosis?: string | null;
          dosage?: string | null;
          frequency?: string | null;
          id?: string;
          medication_id: string;
          organization_id: string;
          patient_id: string;
          provider_id: string;
          quantity?: number | null;
          updated_at?: string;
          written_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["prescriptions"]["Insert"]>;
      };
      prior_authorizations: {
        Row: {
          appeal_required: boolean;
          case_id: string;
          clinical_requirements: string | null;
          created_at: string;
          decision_due_at: string | null;
          decided_at: string | null;
          denial_reason: string | null;
          id: string;
          notes: string | null;
          organization_id: string;
          payer_case_id: string | null;
          status: "draft" | "submitted" | "pending" | "approved" | "denied" | "appeal";
          submission_method: "electronic" | "fax" | "portal" | "phone";
          submitted_at: string | null;
          updated_at: string;
        };
        Insert: {
          appeal_required?: boolean;
          case_id: string;
          clinical_requirements?: string | null;
          created_at?: string;
          decision_due_at?: string | null;
          decided_at?: string | null;
          denial_reason?: string | null;
          id?: string;
          notes?: string | null;
          organization_id: string;
          payer_case_id?: string | null;
          status?: "draft" | "submitted" | "pending" | "approved" | "denied" | "appeal";
          submission_method?: "electronic" | "fax" | "portal" | "phone";
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["prior_authorizations"]["Insert"]>;
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          organization_id: string | null;
          phone: string | null;
          role: "admin" | "organizer" | "patients" | "doctor";
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name: string;
          id: string;
          organization_id?: string | null;
          phone?: string | null;
          role?: "admin" | "organizer" | "patients" | "doctor";
          title?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      providers: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          npi: string | null;
          organization_id: string;
          phone: string | null;
          practice_name: string | null;
          specialty: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          npi?: string | null;
          organization_id: string;
          phone?: string | null;
          practice_name?: string | null;
          specialty?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["providers"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
