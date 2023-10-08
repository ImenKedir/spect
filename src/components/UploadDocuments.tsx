import React, { useState } from "react";

interface PdfFile extends File {
  readonly type: "application/pdf";
}

const UploadDocuments: React.FC = () => {
  const [pdfList, setPdfList] = useState<PdfFile[]>([]);
  const [filesAreUploaded, setfilesAreUploaded] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as FileList;

    const pdfFiles: PdfFile[] = [];

    Array.from(files).forEach((file) => {
      if (file.type === "application/pdf") {
        pdfFiles.push(file as PdfFile);
      }
    });

    setPdfList((prevList) => [...prevList, ...pdfFiles]);
    setfilesAreUploaded(true);
  };

  const handlePdfButtonClick = (pdf: PdfFile) => {
    // Handle your PDF button click logic here
    alert(`You clicked on ${pdf.name}`);
  };

  return (
    <div className="mb-2 ml-2 mt-2 w-[235px] ">
      <label className="">
        <input
          id="files"
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
          multiple
          title=" "
          className="mt-1 block w-full rounded-md py-2 text-transparent hover:bg-white/20"
        />
        <div>
          {filesAreUploaded && (
            <h1 className="text-bg-muddy sm:text-1xl mb-3 mt-10 text-2xl font-semibold tracking-tight dark:text-white">
              Your Documents:
            </h1>
          )}
        </div>
      </label>

      <ul className="">
        {pdfList.map((pdf, index) => (
          <li key={index} className="">
            <button
              className="w-[235px] rounded-md py-2 text-left indent-3 no-underline transition hover:bg-white/20"
              onClick={() => handlePdfButtonClick(pdf)}
            >
              <h1 className="text-sm">{pdf.name}</h1>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadDocuments;
