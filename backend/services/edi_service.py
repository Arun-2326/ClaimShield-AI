import datetime
from typing import List, Dict, Any
from backend.models.schemas import ClaimInput

def generate_x12_837p_edi(claim: ClaimInput, prior_auth_number: str = None) -> Dict[str, Any]:
    """
    Generates a realistic ANSI ASC X12N 837P (Professional) claim transaction stream.
    Includes segment-level loop metadata, element definitions, and validation flags.
    """
    timestamp_date = datetime.date.today().strftime("%Y%m%d")
    timestamp_time = datetime.datetime.now().strftime("%H%M")
    service_date_formatted = claim.service_date.replace("-", "")

    segments = []

    def add_seg(tag: str, elements: List[str], loop: str, description: str, is_warning: bool = False, warning_note: str = None):
        raw_line = f"{tag}*{'*'.join(elements)}~"
        segments.append({
            "tag": tag,
            "raw": raw_line,
            "loop": loop,
            "description": description,
            "elements": elements,
            "is_warning": is_warning,
            "warning_note": warning_note
        })

    # Interchange Control Header
    add_seg("ISA", ["00", "          ", "00", "          ", "ZZ", "VITHEALTHSYS   ", "ZZ", f"{claim.payer_id:<15}", timestamp_date, timestamp_time, "^", "00501", "000000901", "0", "P", ":"], "Interchange", "Interchange Control Header")
    add_seg("GS", ["HC", "VITHEALTHSYS", claim.payer_id, timestamp_date, timestamp_time, "1", "X", "005010X222A1"], "Functional Group", "Functional Group Header (Health Care Claim 837)")
    add_seg("ST", ["837", "0001", "005010X222A1"], "Transaction Set", "Transaction Set Header (837 Professional)")
    add_seg("BHT", ["0019", "00", claim.claim_id, timestamp_date, timestamp_time, "CH"], "Header", "Beginning of Hierarchical Transaction (Chargeable Claim)")

    # Submitter & Receiver Loops
    add_seg("NM1", ["41", "2", "MEMORIAL HERMANN HEALTH", "", "", "", "", "46", "NPI1982001402"], "Loop 1000A", "Submitter Name & Organization NPI")
    add_seg("PER", ["IC", "BILLING OPS EDI DESK", "TE", "8005550199", "EX", "4102"], "Loop 1000A", "Submitter EDI Contact Information")
    add_seg("NM1", ["40", "2", claim.payer_id, "", "", "", "", "46", f"PAYER_{claim.payer_id}"], "Loop 1000B", "Receiver / Health Plan Destination")

    # Billing Provider Hierarchical Level
    add_seg("HL", ["1", "", "20", "1"], "Loop 2000A", "Billing Provider Hierarchical Level")
    add_seg("PRV", ["BI", "PXC", "207Q00000X"], "Loop 2000A", f"Provider Specialty Taxonomy ({claim.provider_specialty})")
    add_seg("NM1", ["85", "2", "MEMORIAL PHYSICIANS GRP", "", "", "", "", "XX", "1982001402"], "Loop 2010AA", "Billing Provider Name & Type")
    add_seg("N3", ["6411 FANNIN ST"], "Loop 2010AA", "Billing Provider Street Address")
    add_seg("N4", ["HOUSTON", "TX", "77030"], "Loop 2010AA", "Billing Provider City, State, ZIP")

    # Subscriber & Patient Level
    add_seg("HL", ["2", "1", "22", "0"], "Loop 2000B", "Subscriber Hierarchical Level")
    add_seg("SBR", ["P", "18", "", "", "", "", "", "", "CI"], "Loop 2000B", "Subscriber Information (Primary Insurance)")
    add_seg("NM1", ["IL", "1", "DOE", "SYNTHETIC", "", "", "", "MI", claim.patient_id], "Loop 2010BA", "Subscriber / Patient Demographics")
    add_seg("DMG", ["D8", "19850412", "M"], "Loop 2010BA", "Patient Demographic Information (DOB & Gender)")

    # Claim Information Level
    add_seg("CLM", [claim.claim_id, f"{claim.claim_amount:.2f}", "", "", "11:B:1", "Y", "A", "Y", "Y"], "Loop 2300", f"Claim Level Information — Total Charge ${claim.claim_amount:.2f}")

    # Prior Authorization Segment (REF*G1)
    auth_num = prior_auth_number or ("AUTH" + claim.claim_id.replace("CLM_", "A") if claim.prior_auth_flag else None)
    if claim.prior_auth_flag or auth_num:
        add_seg("REF", ["G1", auth_num or "AUTH9988210"], "Loop 2300", "Prior Authorization Certification Number (Box 23)", False)
    else:
        # Check if auth needed
        cpt_primary = claim.cpt_codes[0] if claim.cpt_codes else "99213"
        needs_auth = cpt_primary in ["29881", "43239", "70450"]
        if needs_auth:
            add_seg("REF", ["G1", "[MISSING_REQUIRED_AUTH]"], "Loop 2300", "MISSING Prior Authorization Reference Segment (Required for CPT " + cpt_primary + ")", True, "Mandatory Loop 2300 REF*G1 is absent. Triggers CARC CO-197 rejection.")

    # Diagnosis Hierarchy (HI)
    diag_elements = []
    for idx, icd in enumerate(claim.icd_codes[:4]):
        qualifier = "ABK" if idx == 0 else "ABF"  # Primary ICD-10 vs Secondary
        clean_icd = icd.replace(".", "")
        diag_elements.append(f"{qualifier}:{clean_icd}")
    add_seg("HI", diag_elements, "Loop 2300", f"Health Care Diagnosis Codes (ICD-10-CM: {', '.join(claim.icd_codes)})")

    # Service Line Loops (Loop 2400)
    for line_num, cpt in enumerate(claim.cpt_codes, start=1):
        line_charge = claim.claim_amount / len(claim.cpt_codes)
        add_seg("LX", [str(line_num)], "Loop 2400", f"Service Line Counter #{line_num}")
        add_seg("SV1", [f"HC:{cpt}", f"{line_charge:.2f}", "UN", "1", "", "", "1"], "Loop 2400", f"Professional Service Line #{line_num} — CPT {cpt}, Charge ${line_charge:.2f}")
        add_seg("DTP", ["472", "D8", service_date_formatted], "Loop 2400", f"Date of Service: {claim.service_date}")

    # Trailer Segments
    add_seg("SE", [str(len(segments) + 1), "0001"], "Transaction Set", "Transaction Set Trailer")
    add_seg("GE", ["1", "1"], "Functional Group", "Functional Group Trailer")
    add_seg("IEA", ["1", "000000901"], "Interchange", "Interchange Control Trailer")

    full_edi_text = "\n".join([s["raw"] for s in segments])

    return {
        "claim_id": claim.claim_id,
        "segment_count": len(segments),
        "full_edi_stream": full_edi_text,
        "segments": segments,
        "has_validation_warning": any(s["is_warning"] for s in segments)
    }
