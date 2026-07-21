import { Link } from "react-router-dom";
import { DocumentSummary } from "../api";
import { compact, DataTable } from "../components/ui";

export function DocumentTable({
  documents,
  admin = false,
}: {
  documents: DocumentSummary[];
  admin?: boolean;
}) {
  return (
    <DataTable
      headers={admin ? ["제목", "상태", "작업"] : ["제목", "위치", "요약"]}
      rows={documents.map((d) =>
        admin
          ? [
              d.title,
              d.status,
              <Link
                className={compact}
                to={`/admin/documents/${d.documentId}/edit`}
              >
                편집
              </Link>,
            ]
          : [
              d.title,
              d.folderName ?? "-",
              d.summary ?? (
                <Link className={compact} to={`/documents/${d.documentId}`}>
                  열람
                </Link>
              ),
            ],
      )}
    />
  );
}
