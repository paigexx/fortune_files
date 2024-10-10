"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const inputFile = useRef<HTMLInputElement>(null);
  const [fortune, setFortune] = useState<string>("");
  const [error, setError] = useState<string>("");

  const uploadFile = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    try {
      setUploading(true);
      setError(""); 

      const keyRes = await fetch("/api/keys", {
        method: "GET",
      });
      if (!keyRes.ok) {
        throw new Error(`Error fetching keys: ${keyRes.statusText}`);
      }
      const oneTimeKey = await keyRes.json();

      const data = new FormData();
      data.append("file", file);
      data.append("keyvalues", JSON.stringify({ example: true }));

      const fileRes = await fetch("https://uploads.pinata.cloud/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${oneTimeKey.JWT}`,
        },
        body: data,
      });
      if (!fileRes.ok) {
        const errorText = await fileRes.text();
        throw new Error(`Error uploading file: ${errorText}`);
      }
      const uploadedFile = await fileRes.json();

      const fortuneRes = await fetch("/api/fortune", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid: uploadedFile.data.cid }),
      });
      if (!fortuneRes.ok) {
        const errorText = await fortuneRes.text();
        throw new Error(`Error fetching fortune: ${errorText}`);
      }
      const fortuneData = await fortuneRes.json();
      setFortune(fortuneData.message);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        setError(e.message);
      } else {
        console.error("An unknown error occurred:", e);
        setError("An unknown error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(""); 
      console.log(e.target.files[0]);
    }
  };

  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <nav className="flex justify-between w-full p-4">
        <div>
          <h1 className="text-lime-500 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
            Fortune Files
          </h1>
        </div>
      </nav>

      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {!fortune && !uploading && (
          <form className="flex flex-col gap-4 items-center" onSubmit={uploadFile}>
            <input
              type="file"
              onChange={handleChange}
              id="file"
              ref={inputFile}
              className="block w-80 pr-2 text-sm text-black bg-white rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-lime-500 file:text-white hover:file:bg-lime-600"
            />
            <button
              type="submit"
              disabled={!file}
              className="px-4 py-2 bg-lime-500 text-black rounded-full border border-black hover:bg-lime-500 hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Fortune 🥠
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        )}

        {fortune && !uploading && (
          <div className="flex flex-col gap-4 items-center">
            <p className="text-white text-lg text-center">{fortune}</p>
            <div>
              <button
                onClick={() => {
                  setFortune("");
                  setFile(null);
                  if (inputFile.current) {
                    inputFile.current.value = "";
                  }
                }}
                className="my-4 px-4 py-2 bg-lime-500 text-black rounded-full border border-black hover:bg-lime-500 hover:text-white transition duration-300"
              >
                Try Again 🥠
              </button>
            </div>
          </div>
        )}
        {uploading && <p className="text-white text-lg">Cookie is thinking...</p>}
      </main>

      <footer className="row-start-3">
        <p className="text-white text-sm">© 2024 Fortune Files</p>
      </footer>
    </div>
  );
}
