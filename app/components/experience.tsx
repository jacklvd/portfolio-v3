"use client"
import React, { useState, useEffect } from 'react';
import { client } from '@/client/client';
import { ChevronDown } from 'lucide-react';

interface Experience {
    _id: string;
    position: string;
    company: string;
    date: string;
    url: string;
    description: string;
}

const ExperienceSection: React.FC = () => {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMobile(window.innerWidth < 768);
            const handleResize = () => {
                setIsMobile(window.innerWidth < 768);
            };
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    useEffect(() => {
        const fetchExperiences = async () => {
            const query = `*[_type == "experience"] | order(date desc) {
                _id,
                position,
                company,
                date,
                url,
                description
            }`;
            try {
                const fetchedExperiences = await client.fetch(query);
                setExperiences(fetchedExperiences);
                if (fetchedExperiences.length > 0) {
                    setSelectedId(fetchedExperiences[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch experiences:', error);
            }
        };
        fetchExperiences();
    }, []);

    const selectedExperience = experiences.find(exp => exp._id === selectedId) || experiences[0];

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const selectCompany = (id: string) => {
        setSelectedId(id);
        setDropdownOpen(false);
    };

    if (experiences.length === 0) return <div>Loading experiences...</div>;

    return (
        <div className="bg-gray-900 text-gray-300 p-8 font-sans max-w-7xl mx-auto">
            <h2 className="text-2xl font-light mb-6">Experience</h2>

            <div className="flex flex-col md:flex-row">
                <div className={`w-full md:flex-none md:w-64 ${isMobile ? 'mb-4' : 'pr-4'}`}>
                    {isMobile ? (
                        <div className="md:hidden w-full mb-4">
                            <div
                                className="bg-gray-800 p-2 rounded-md flex justify-between items-center cursor-pointer"
                                onClick={toggleDropdown}
                            >
                                <span>{selectedExperience.company}</span>
                                <ChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                            </div>
                            {isDropdownOpen && (
                                <div className="mt-2 bg-gray-800 rounded-md overflow-hidden">
                                    {experiences.map((exp) => (
                                        <div
                                            key={exp._id}
                                            className={`p-2 cursor-pointer hover:bg-gray-700 ${selectedId === exp._id ? 'bg-gray-700' : ''}`}
                                            onClick={() => selectCompany(exp._id)}
                                        >
                                            {exp.company}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        experiences.map((exp) => (
                            <div
                                key={exp._id}
                                className={`mb-2 text-sm cursor-pointer hover:text-green-400 transition-colors duration-200 ${selectedId === exp._id ? 'text-green-400' : ''}`}
                                onClick={() => setSelectedId(exp._id)}
                            >
                                {exp.company}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex-grow md:border-l md:border-gray-700 md:pl-6">
                    <h3 className="text-lg font-semibold">
                        {selectedExperience.position}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{selectedExperience.date}</p>

                    <div className="space-y-4">
                        <p>{selectedExperience.description}</p>
                        <a href={selectedExperience.url} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                            Learn more
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceSection;
