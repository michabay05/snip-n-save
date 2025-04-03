import "./index.css";
import { JSX, useEffect, useId, useState } from "react";

type Snippet = {
    id: number;
    quote: string;
    source: string;
};

const LS_SNIPS_KEY: string = "snipArr";
const GOOD_INPUT_COLOR: string = "border-blue-700";
const BAD_INPUT_COLOR: string = "border-red-600";

// Adding to the context menu (i.e right click menu)
// Source: https://developer.chrome.com/docs/extensions/reference/api/contextMenus#method-create

export default function App(): JSX.Element {
    const [snippet, setSnipArr] = useState(new Array<Snippet>());

    // Load snippet array on mount
    useEffect((): void => {
        chrome.storage.sync.get(LS_SNIPS_KEY)
            .then(val => {
                console.log("sync storage value loaded");
                console.log(JSON.stringify(val));
                if (val[LS_SNIPS_KEY]) setSnipArr(val[LS_SNIPS_KEY]);
            }).catch(() => {
                console.warn("Could not load sync storage value");
            });
    }, []);

    const quoteID = useId();
    const sourceID = useId();

    const updateLocalStorage = (snipArr: Array<Snippet>): void => {
        // localStorage.setItem(LS_SNIPS_KEY, JSON.stringify(snipArr));
        chrome.storage.sync.set({ "snipArr": snipArr })
            .then(() => console.log("snippet updated in local storage"));
    };

    const addSnippet = (): void => {
        const quoteInput = document.getElementById(quoteID);
        const sourceInput = document.getElementById(sourceID);
        if (quoteInput === null || sourceInput === null) return;
        const quote: string = (quoteInput as HTMLInputElement).value;
        const source: string = (sourceInput as HTMLInputElement).value;

        // Verify if source is a valid url
        if (!URL.canParse(source)) {
            // Highlight link with a red border
            sourceInput.classList.remove(GOOD_INPUT_COLOR);
            sourceInput.classList.add(BAD_INPUT_COLOR);
            return;
        } else {
            sourceInput.classList.remove(BAD_INPUT_COLOR);
            sourceInput.classList.add(GOOD_INPUT_COLOR);
        }

        const newSnip: Snippet = {
            id: Date.now(),
            quote, source,
        };
        const updatedSnipArr = [...snippet, newSnip];
        setSnipArr(updatedSnipArr);
        // Clear inputs after saving snippet
        (quoteInput as HTMLInputElement).value = "";
        (sourceInput as HTMLInputElement).value = "";
        // Save to localStorage
        updateLocalStorage(updatedSnipArr);
    };

    const removeSnippet = (id: number): void => {
        const updatedSnipArr = snippet.filter(snip => snip.id != id);
        setSnipArr(updatedSnipArr);
        updateLocalStorage(updatedSnipArr);
    };

    const visitLink = (id: number): void => {
        const link: Snippet | undefined = snippet.find(snip => snip.id == id);
        if (link) window.open(link.source, "_blank");
    };

    return (
        <div className="mx-auto w-sm my-4">
            <div className="flex flex-col place-items-center w-5/6 mx-auto">
                <h2 className="text-2xl font-delius text-center my-2">SnipSave</h2>
                <p className="font-delius text-center my-2">
                    You have {snippet.length ? snippet.length : "no"} snippets! Let's add some more!
                </p>
                <input
                    className={`border-2 ${GOOD_INPUT_COLOR} py-1 px-2 rounded-md container truncate focus:outline-blue-400`}
                    id={quoteID}
                    type="text" placeholder="Quote" />
                <input
                    className={`border-2 ${GOOD_INPUT_COLOR} my-3 py-1 px-2 rounded-md container truncate focus:outline-blue-400`}
                    id={sourceID} type="text" placeholder="Source" />
                <div className="container flex justify-center">
                    <button
                        className="border bg-blue-800 text-white font-quattrocento font-bold hover:cursor-pointer rounded-md px-8 py-2"
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
        <div className="container my-3 py-2 px-2 flex w-full justify-between border rounded">
            <button
                onClick={() => prop.removeFn(id)}
                className="cursor-pointer">
                <DeleteTrash />
            </button>
            <div className="m-auto w-3/4">
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
