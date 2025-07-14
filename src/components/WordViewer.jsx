import React from "react";

const WordViewer = () => {
  const fileUrl =
    "https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx";

  return (
    <iframe
      src={fileUrl}
      width="100%"
      height="800px"
      frameBorder="0"
      title="Word Viewer"
      allowFullScreen
    />
  );
};

export default WordViewer;
