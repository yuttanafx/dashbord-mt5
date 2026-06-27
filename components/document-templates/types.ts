import { BusinessDocument, CompanyProfile } from "@/lib/types";

export interface DocumentTemplateProps {
  doc: BusinessDocument;
  companyProfile: CompanyProfile;
  total: number;
}
