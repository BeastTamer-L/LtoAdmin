export default function TopSection({activeTab}) {


return (
    <div className='bg-white w-full border-b-[1px] border-[#D9D9D9] flex items-center px-6 py-6'>
        <h2 className='text-lg font-semibold text-[16px] '>{activeTab}</h2>
    </div>
)


}