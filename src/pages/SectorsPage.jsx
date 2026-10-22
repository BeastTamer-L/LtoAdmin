import { useEffect, useState, useCallback } from 'react'
import { Search } from "lucide-react";
import Table from '../components/Table'
import { toast } from 'sonner';
import { supabase } from '../supabaseClient';
import SectorModal from '../components/SectorModal';

const formatEnforcerName = (firstName, lastName) => {
    const first = firstName || '';
    const initials = first
        .split(' ')
        .filter(part => part.length > 0)
        .map(part => part[0])
        .join('');
    if (initials && lastName) {
        return `${initials}. ${lastName}`;
    }
    return `${first} ${lastName || ''}`.trim();
};

export default function Sectors() {
    const [search, setSearch] = useState('');
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadSectors = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all sectors
            const { data: sectorsData, error: sectorsError } = await supabase
                .from('sectors')
                .select('id, name, location');

            if (sectorsError) throw sectorsError;

            // Fetch enforcer counts per area
            const { data: enforcerCountsData, error: enforcerCountsError } = await supabase
                .from('profiles')
                .select('area_of_assignment')
                .eq('role', 'enforcer')
                .group('area_of_assignment');

            if (enforcerCountsError) throw enforcerCountsError;

            // Build count map: area -> count
            const countMap = new Map();
            (enforcerCountsData || []).forEach(row => {
                const area = row.area_of_assignment;
                const count = row.count; // Note: group returns count as 'count'
                countMap.set(area, count);
            });

            // Fetch sector commanders (position='sector commander') with their sector
            const { data: commandersData, error: commandersError } = await supabase
                .from('profiles')
                .select('first_name, last_name, area_of_assignment')
                .eq('position', 'sector commander');

            if (commandersError) throw commandersError;

            // Build commander map: area -> formatted name
            const commanderMap = new Map();
            (commandersData || []).forEach(profile => {
                const formatted = formatEnforcerName(profile.first_name, profile.last_name);
                commanderMap.set(profile.area_of_assignment, formatted);
            });

            // Build sector list
            const sectorList = (sectorsData || []).map(sector => ({
                sectorName: sector.name || 'Unknown',
                location: sector.location || 'Unknown',
                sectorCommander: commanderMap.get(sector.name) || '—',
                enforcerCount: countMap.get(sector.name) || 0,
            }));

            // Sort by sectorName maybe
            sectorList.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

            setSectors(sectorList);
        } catch (error) {
            toast.error(`Failed to load sectors: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            await loadSectors();
        };
        loadData();
    }, [loadSectors]);

    const filteredData = sectors.filter(sector => {
        const query = search.trim().toLowerCase();
        const name = sector.sectorName.toLowerCase();
        const loc = sector.location.toLowerCase();
        return !query || name.includes(query) || loc.includes(query);
    });

    const handleModalSubmit = () => {
        // The modal saved the sector directly to Supabase.
        // Close it and refresh the table so the new row shows up.
        setIsModalOpen(false);
        loadSectors();
    };

    const columns = [
        {
            key: 'sectorName',
            label: 'Sector Name',
        },
        {
            key: 'location',
            label: 'Location',
        },
        {
            key: 'sectorCommander',
            label: 'Sector Commander',
        },
        {
            key: 'enforcerCount',
            label: 'Number of Assigned Enforcers',
        },
    ];

    return (
        <div className='bg-white w-full h-full border-[1px] border-[#E2E8F0] px-6 py-6 rounded-lg'>
            <div className='flex items-center justify-between mb-[60px]'>
                <div className='relative flex items-center'>
                    <Search className="text-[#7E8998] absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by sector name or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[350px] bg-[#F0F4F8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED6704] text-[14px] text-[#475569] pl-[50px] pr-5 py-2"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Add Sector
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-sm text-[#8693A6]">Loading sectors...</div>
            ) : (
                <Table columns={columns} data={filteredData} />
            )}
            <SectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                handleSubmit={handleModalSubmit}
            />
        </div>
    );
}
