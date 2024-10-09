"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const inputFile = useRef(null);
  const [fortune, setFortune] = useState<string>("");

  const uploadFile = async (e: any) => {
    e.preventDefault();
    try {
      setUploading(true);
      const keyRes = await fetch("/api/keys", {
        method: "GET",
      });
      const oneTimeKey = await keyRes.json();
      const data = new FormData();
      data.set("file", file);
      data.set("keyvalues", JSON.stringify({ example: true }));
      const fileRes = await fetch(
        "https://uploads.pinata.cloud/v3/files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${oneTimeKey.JWT}`,
          },
          body: data,
        }
      );
      const uploadedFile = await fileRes.json();
      const fortuneRes = await fetch("/api/fortune", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid: uploadedFile.data.cid }),
      });
      const fortune = await fortuneRes.json();
      setFortune(fortune.message);
      setUploading(false);

    } catch (e) {
      console.log(e);
      setUploading(false);
    }
  };

  const handleChange = (e: any) => {
    setFile(e.target.files[0]);
    console.log(e.target.files[0]);
  };

  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      {/* Navbar */}
      <nav className="flex justify-between w-full p-4">
        <div>
          <h1 className="text-lime-500 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
            Fortune Files
          </h1>
        </div>
      </nav>

      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {!fortune && !uploading &&
        <form className="flex flex-col gap-4 items-center" onSubmit={uploadFile}>
          <input
            type="file"
            onChange={handleChange}
            id="file" ref={inputFile}
            className="block w-80 pr-2 text-sm text-black bg-white rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-lime-500 file:text-white hover:file:bg-lime-600"
          />
          <button
            type="submit"
            disabled={uploading || !file}
            className="px-4 py-2 bg-lime-500 text-black rounded-full border border-black hover:bg-lime-500 hover:text-white transition duration-300"
          >
            Get Fortune 🥠
          </button>
        </form>
        }

        {fortune && !uploading &&
        <div className="flex flex-col gap-4 items-center">
          <p className="text-white text-lg text-center">{fortune}</p>
          <div>
            <a
              href="/"
              className="my-4 px-4 py-2 bg-lime-500 text-black rounded-full border border-black hover:bg-lime-500 hover:text-white transition duration-300"
            >
              Try Again 🥠
            </a>
          </div>
        </div>
        
      }
      {uploading && 
        <p className="text-white text-lg">Cookie is thinking...</p>
        }
      </main>

      <footer className="row-start-3">
        <p className="text-white text-sm">© 2024 Fortune Files</p>
      </footer>
    </div>
  );
}
