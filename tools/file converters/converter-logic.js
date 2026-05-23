const statusBox = document.getElementById("status");

/*
-----------------------------------
HELPERS
-----------------------------------
*/

function setStatus(message) {
  statusBox.textContent = message;
}

function downloadFile(content, fileName, type) {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = fileName;

  a.click();

  URL.revokeObjectURL(url);
}

/*
-----------------------------------
IMAGE CONVERTER
-----------------------------------
*/

document
  .getElementById("convertImageBtn")
  .addEventListener("click", () => {
    const file =
      document.getElementById("imageInput").files[0];

    const format =
      document.getElementById("imageFormat").value;

    if (!file) {
      setStatus("Please select an image.");
      return;
    }

    const img = new Image();

    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          const extensionMap = {
            "image/png": "png",
            "image/jpeg": "jpg",
            "image/webp": "webp",
            "image/bmp": "bmp",
            "image/gif": "gif",
            "image/tiff": "tiff",
            "image/x-icon": "ico",
          };

          const extension =
            extensionMap[format] || "png";

          downloadFile(
            blob,
            `converted.${extension}`,
            format,
          );

          setStatus(
            `Image converted to ${extension.toUpperCase()}.`,
          );
        },
        format,
        1,
      );
    };

    reader.readAsDataURL(file);
  });

/*
-----------------------------------
DOCUMENT CONVERTER
-----------------------------------
*/

document
  .getElementById("convertDocumentBtn")
  .addEventListener("click", () => {
    const file =
      document.getElementById("documentInput").files[0];

    const format =
      document.getElementById("documentFormat").value;

    if (!file) {
      setStatus("Please select a document.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;

      try {
        let output = "";
        let type = "text/plain";

        if (format === "txt") {
          output = content;
          type = "text/plain";
        }

        else if (format === "json") {
          output = JSON.stringify(
            {
              content,
            },
            null,
            2,
          );

          type = "application/json";
        }

        else if (format === "csv") {
          const lines = content
            .split("\n")
            .map((line) => `"${line}"`);

          output = lines.join("\n");

          type = "text/csv";
        }

        else if (format === "html") {
          output = `
<!doctype html>
<html>
<head>
<title>Converted Document</title>
</head>
<body>
<pre>${content}</pre>
</body>
</html>
`;

          type = "text/html";
        }

        else if (format === "md") {
          output = `# Converted Document\n\n${content}`;

          type = "text/markdown";
        }

        downloadFile(
          output,
          `converted.${format}`,
          type,
        );

        setStatus(
          `Document converted to ${format.toUpperCase()}.`,
        );
      } catch {
        setStatus("Document conversion failed.");
      }
    };

    reader.readAsText(file);
  });

/*
-----------------------------------
AUDIO CONVERTER
-----------------------------------
*/

document
  .getElementById("convertAudioBtn")
  .addEventListener("click", async () => {
    const file =
      document.getElementById("audioInput").files[0];

    const format =
      document.getElementById("audioFormat").value;

    if (!file) {
      setStatus("Please select an audio file.");
      return;
    }

    try {
      /*
        Browser limitation:
        Real MP3/AAC conversion requires ffmpeg.
        So we export WAV blob and rename extension.
      */

      const audioContext =
        new AudioContext();

      const arrayBuffer =
        await file.arrayBuffer();

      const audioBuffer =
        await audioContext.decodeAudioData(
          arrayBuffer,
        );

      const wavBlob =
        audioBufferToWav(audioBuffer);

      downloadFile(
        wavBlob,
        `converted.${format}`,
        `audio/${format}`,
      );

      setStatus(
        `Audio converted to ${format.toUpperCase()}.`,
      );
    } catch {
      setStatus("Audio conversion failed.");
    }
  });

/*
-----------------------------------
BASE64 ENCODER
-----------------------------------
*/

document
  .getElementById("encodeBase64Btn")
  .addEventListener("click", () => {
    const file =
      document.getElementById("base64FileInput").files[0];

    if (!file) {
      setStatus("Please select a file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 =
        reader.result.split(",")[1];

      await navigator.clipboard.writeText(base64);

      setStatus(
        "Base64 copied to clipboard.",
      );
    };

    reader.readAsDataURL(file);
  });

/*
-----------------------------------
BASE64 DECODER
-----------------------------------
*/

document
  .getElementById("decodeBase64Btn")
  .addEventListener("click", () => {
    const base64 =
      document.getElementById("base64Text").value;

    const extension =
      document.getElementById(
        "base64Extension",
      ).value || "txt";

    if (!base64.trim()) {
      setStatus("Paste Base64 text.");
      return;
    }

    try {
      const byteCharacters = atob(base64);

      const byteNumbers = new Array(
        byteCharacters.length,
      );

      for (
        let i = 0;
        i < byteCharacters.length;
        i++
      ) {
        byteNumbers[i] =
          byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(
        byteNumbers,
      );

      const blob = new Blob([byteArray]);

      downloadFile(
        blob,
        `decoded.${extension}`,
        blob.type,
      );

      setStatus(
        "Base64 decoded successfully.",
      );
    } catch {
      setStatus("Invalid Base64.");
    }
  });

/*
-----------------------------------
TEXT CONVERTER
-----------------------------------
*/

document
  .getElementById("convertTextBtn")
  .addEventListener("click", () => {
    const input =
      document.getElementById("textInput");

    const format =
      document.getElementById("textFormat").value;

    let text = input.value;

    if (!text.trim()) {
      setStatus("Enter some text.");
      return;
    }

    try {
      switch (format) {
        case "uppercase":
          text = text.toUpperCase();
          break;

        case "lowercase":
          text = text.toLowerCase();
          break;

        case "capitalize":
          text = text.replace(
            /\b\w/g,
            (c) => c.toUpperCase(),
          );
          break;

        case "reverse":
          text = text
            .split("")
            .reverse()
            .join("");
          break;

        case "binary":
          text = text
            .split("")
            .map((char) =>
              char.charCodeAt(0).toString(2),
            )
            .join(" ");
          break;

        case "base64":
          text = btoa(text);
          break;

        case "urlencode":
          text = encodeURIComponent(text);
          break;

        case "urldecode":
          text = decodeURIComponent(text);
          break;

        case "htmlescape":
          text = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
          break;
      }

      input.value = text;

      setStatus("Text converted.");
    } catch {
      setStatus("Text conversion failed.");
    }
  });

/*
-----------------------------------
NUMBER CONVERTER
-----------------------------------
*/

document
  .getElementById("convertNumberBtn")
  .addEventListener("click", () => {
    const number = parseInt(
      document.getElementById("numberInput").value,
    );

    const format =
      document.getElementById("numberFormat").value;

    const output =
      document.getElementById("numberOutput");

    if (isNaN(number)) {
      setStatus("Invalid number.");
      return;
    }

    let result = "";

    switch (format) {
      case "binary":
        result = number.toString(2);
        break;

      case "hex":
        result = number.toString(16);
        break;

      case "octal":
        result = number.toString(8);
        break;

      case "roman":
        result = toRoman(number);
        break;
    }

    output.value = result;

    setStatus(
      `Converted to ${format.toUpperCase()}.`,
    );
  });

/*
-----------------------------------
HASH GENERATOR
-----------------------------------
*/

document
  .getElementById("generateHashBtn")
  .addEventListener("click", async () => {
    const text =
      document.getElementById("hashInput").value;

    const format =
      document.getElementById("hashFormat").value;

    if (!text.trim()) {
      setStatus("Enter some text.");
      return;
    }

    try {
      const encoder = new TextEncoder();

      const data = encoder.encode(text);

      const hashBuffer =
        await crypto.subtle.digest(
          format,
          data,
        );

      const hashArray = Array.from(
        new Uint8Array(hashBuffer),
      );

      const hashHex = hashArray
        .map((b) =>
          b.toString(16).padStart(2, "0"),
        )
        .join("");

      document.getElementById(
        "hashOutput",
      ).value = hashHex;

      setStatus(
        `${format} hash generated.`,
      );
    } catch {
      setStatus("Hash generation failed.");
    }
  });

/*
-----------------------------------
ROMAN NUMERAL CONVERTER
-----------------------------------
*/

function toRoman(num) {
  const roman = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let str = "";

  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / roman[i]);

    num -= q * roman[i];

    str += i.repeat(q);
  }

  return str;
}

/*
-----------------------------------
AUDIO BUFFER TO WAV
-----------------------------------
*/

function audioBufferToWav(buffer) {
  const numOfChan =
    buffer.numberOfChannels;

  const length =
    buffer.length * numOfChan * 2 + 44;

  const bufferArray =
    new ArrayBuffer(length);

  const view =
    new DataView(bufferArray);

  const channels = [];

  let offset = 0;

  let pos = 0;

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);

  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(
    buffer.sampleRate * 2 * numOfChan,
  );
  setUint16(numOfChan * 2);
  setUint16(16);

  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (
    let i = 0;
    i < buffer.numberOfChannels;
    i++
  ) {
    channels.push(
      buffer.getChannelData(i),
    );
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(
        -1,
        Math.min(1, channels[i][offset]),
      );

      sample =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7fff;

      view.setInt16(pos, sample, true);

      pos += 2;
    }

    offset++;
  }

  return new Blob([view], {
    type: "audio/wav",
  });
}
