import { JSX, useId, useState } from "react";
import "./index.css";

type Snippet = {
    id: number;
    quote: string;
    source: string;
};

const LS_SNIPS_KEY: string = "snipArr";

export default function App(): JSX.Element {
    const [snippet, setSnipArr] = useState((): Array<Snippet> => {
        const localSnipArr = localStorage.getItem(LS_SNIPS_KEY);
        return localSnipArr ? JSON.parse(localSnipArr) : new Array<Snippet>();
    });

    const quoteID = useId();
    const linkID = useId();

    const updateLocalStorage = (snipArr: Array<Snippet>): void => {
        localStorage.setItem(LS_SNIPS_KEY, JSON.stringify(snipArr));
    };

    const addSnippet = (): void => {
        const quoteInput = document.getElementById(quoteID);
        const linkInput = document.getElementById(linkID);
        if (quoteInput === null || linkInput === null) return;
        const newSnip: Snippet = {
            id: Date.now(),
            quote: (quoteInput as HTMLInputElement).value,
            source: (linkInput as HTMLInputElement).value,
        };
        const updatedSnipArr = [...snippet, newSnip];
        setSnipArr(updatedSnipArr);
        // Clear inputs after saving snippet
        (quoteInput as HTMLInputElement).value = "";
        (linkInput as HTMLInputElement).value = "";
        // Save to localStorage
        updateLocalStorage(updatedSnipArr);
    };

    const removeSnippet = (id: number): void => {
        const updatedSnipArr = snippet.filter(snip => snip.id != id);
        setSnipArr(updatedSnipArr);
        updateLocalStorage(updatedSnipArr);
    };

    const visitLink = (id: number): void => {
        const link: Snippet | null = snippet.find(snip => snip.id == id);
        if (link) window.open(link.source, "_blank");
    };

    return (
        <div className="mx-auto max-w-xl">
            <div className="flex flex-col place-items-center w-5/6 mx-auto">
                <p className="font-delius text-center my-2">
                    You have {snippet.length ? snippet.length : "no"} snippets! Let's add some more!
                </p>
                <input
                    className="border-2 border-blue-700 py-1 px-2 rounded-md container truncate focus:outline-blue-400"
                    id={quoteID}
                    type="text" placeholder="Quote" />
                <input
                    className="border-2 border-blue-700 my-3 py-1 px-2 rounded-md container truncate focus:outline-blue-400"
                    id={linkID} type="text" placeholder="Link" />
                <div className="container flex justify-center">
                    <button
                        className="border bg-blue-800 text-white font-quattrocento hover:cursor-pointer font-bold rounded-md px-8 py-2"
                        onClick={addSnippet}>Save</button>
                </div>
            </div>

            <div className="w-5/6 mx-auto">
                {snippet.map((snip: Snippet) =>
                    <Snippet key={snip.id}
                        snippet={snip} removeFn={removeSnippet}
                        visitLink={visitLink}
                    />
                )}
            </div>
        </div>
    );
}

interface SnippetProps {
    snippet: Snippet;
    removeFn: (id: number) => void;
    visitLink: (id: number) => void;
};

function Snippet(prop: SnippetProps): JSX.Element {
    const {id, quote, source} = prop.snippet;

    return (
        <div className="container my-3 py-2 px-4 flex w-full justify-between border rounded">
            <button
                onClick={() => prop.removeFn(id)}
                className="cursor-pointer">
                <DeleteTrash />
            </button>
            <div className="m-auto w-4/5">
                <p className="font-delius text-md truncate">{`"${quote}"`}</p>
                <p className="font-quattrocento text-xs text-gray-600 truncate">{source}</p>
            </div>
            <button
                onClick={() => prop.visitLink(id)}
                className="cursor-pointer">
                <VisitLink />
            </button>
        </div>
    );
}

function DeleteTrash(): JSX.Element {
    // Source: https://lucide.dev/icons/trash
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="stroke-red-500">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
    );
}

function VisitLink(): JSX.Element {
    // Source: lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="stroke-green-600">
            <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/>
            <path d="m21 3-9 9"/>
            <path d="M15 3h6v6"/>
        </svg>
    );
}
