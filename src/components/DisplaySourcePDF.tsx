import { useState, useCallback } from "react";
// import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import { Document, Page, pdfjs } from "react-pdf";
// import { Document, Page } from "@react-pdf/renderer";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

type Doc = {
  metadata: {
    page_number: number;
    source: string;
  };
  pageContent: string;
};

function highlightPattern(text: string, pattern: string) {
  return text.replace(pattern, (value) => `<mark>${value}</mark>`);
}

const Source: React.FC<{
  onClick: (pageNumber: number, pdfName: string, sourceText: string) => void;
  doc: Doc;
}> = ({ doc, onClick }) => {
  console.log(doc);
  return (
    <button
      className="font-thin text-blue-500 hover:text-blue-700"
      onClick={() =>
        onClick(doc.metadata.page_number, doc.metadata.source, doc.pageContent)
      }
    >
      {`${doc.metadata.source} page ${doc.metadata.page_number}`}
    </button>
  );
};

const DisplaySourcePDF: React.FC<{ docs: Doc[] }> = ({ docs }) => {
  console.log(docs);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPdf, setCurrentPdf] = useState<string>("");
  const [showPdf, setShowPdf] = useState<boolean>(false);
  const [sourceText, setSourceText] = useState<string>("");

  const onButtonClick = (
    pageNumber: number,
    pdfName: string,
    sourceText: string
  ) => {
    if (currentPdf === pdfName && showPdf) {
      setShowPdf(false);
    } else {
      setCurrentPage(pageNumber);
      setCurrentPdf(pdfName);
      setSourceText(sourceText);
      setShowPdf(true);
    }
  };

  const textRenderer = useCallback(
    (textItem: { str: string }) => highlightPattern(textItem.str, sourceText),
    [sourceText]
  );

  return (
    <div>
      <ol className="divide-y flex flex-col">
        {docs.map((doc, index) => (
          <Source key={index} onClick={onButtonClick} doc={doc} />
        ))}
      </ol>
      <div>
        {showPdf && (
          <Document file={currentPdf}>
            <Page
              customTextRenderer={textRenderer}
              pageNumber={currentPage}
              renderTextLayer={false}
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default DisplaySourcePDF;
