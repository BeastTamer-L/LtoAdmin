import { useEffect, useState, useCallback } from 'react'
import { Search } from "lucide-react";
import Table from '../components/Table'
import { toast } from 'sonner';
import { supabase } from '../supabaseClient';
import PositionModal from '../components/PositionModal';

export default function Positions() {
    const [search, setSearch] = useState('');
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadPositions = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all positions
            const { data: positionsData, error: positionsError } = await supabase
                .from('positions')
                .select('id, name');

            if (positionsError) throw positionsError;

            // Fetch enforcer counts per position
            const { data: enforcerCountsData, error: enforcerCountsError } = await supabase
                .from('profiles')
                .select('position')
                .eq('role', 'enforcer')
                .group('position');

            if (enforcerCountsError) throw enforcerCountsError;

            // Build count map: position -> count
            const countMap = new Map();
            (enforcerCountsData || []).forEach(row => {
                const pos = row.position;
                const count = row.count; // Note: group returns count as 'count'
                countMap.set(pos, count);
            });

            // Build position list
            const positionList = (positionsData || []).map(position => ({
                positionName: position.name || 'Unknown',
                enforcerCount: countMap.get(position.name) || 0,
            }));

            // Sort by positionName maybe
            positionList.sort((a, b) => a.positionName.localeCompare(b.positionName));

            setPositions(positionList);
        } catch (error) {
            toast.error(`Failed to load positions: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            await loadPositions();
        };
        loadData();
    }, [loadPositions]);

    const filteredData = positions.filter(position => {
        const query = search.trim().toLowerCase();
        const name = position.positionName.toLowerCase();
        return !query || name.includes(query);
    });

    const handleModalSubmit = () => {
        // The modal saved the position directly to Supabase.
        // Close it and refresh the table so the new row shows up.
        setIsModalOpen(false);
        loadPositions();
    };

    const columns = [
        {
            key: 'positionName',
            label: 'Position Name',
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
                        placeholder="Search by position name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[350px] bg-[#F0F4F8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED6704] text-[14px] text-[#475569] pl-[50px] pr-5 py-2"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Add Position
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-sm text-[#8693A6]">Loading positions...</div>
            ) : (
                <Table columns={columns} data={filteredData} />
            )}
            <PositionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                handleSubmit={handleModalSubmit}
            />
        </div>
    );
}
