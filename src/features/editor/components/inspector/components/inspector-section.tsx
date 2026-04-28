type InspectorSectionProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
};

const InspectorSection: React.FC<InspectorSectionProps> = ({
    title,
    description,
    children,
}: InspectorSectionProps) => {
    return (
        <section className='border-b border-black/10 bg-white px-4 py-4 last:border-b-0'>
            <div className='mb-3'>
                <h2 className='text-xs font-semibold uppercase tracking-[0.08em] text-neutral-700'>
                    {title}
                </h2>
                {description && (
                    <p className='mt-0.5 text-xs text-neutral-500'>
                        {description}
                    </p>
                )}
            </div>
            <div className='space-y-3'>{children}</div>
        </section>
    );
};

export default InspectorSection;
