import { About } from "../components/about";

export default function Portfolio() {
    return (
        <div className="flex flex-col items-center justify-between p-16 sm:p-20 md:p-24">
            <div className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">/ about me</div>
            <About />
        </div>
    )
}