import { cn } from '@/lib/utils';
import { Home, Hotel, Settings2, FileText, CreditCard } from 'lucide-react';

const steps = [
  {
    id: 'residence',
    title: 'Residence Details',
    icon: Home,
    description: 'Add details of your residence',
  },
  {
    id: 'rooms',
    title: 'Room Details',
    icon: Hotel,
    description: 'Add details of the rooms/beds in your residence',
  },
  {
    id: 'amenities',
    title: 'Amenity Details',
    icon: Settings2,
    description: 'Further describe your residence',
  },
  {
    id: 'documents',
    title: 'Documents Upload',
    icon: FileText,
    description: 'Upload supporting documents',
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    description: 'Finalize the process by making payment',
  },
];

function Sidebar({ currentStep }: { currentStep: number }) {
  return (
    <div className="lg:col-span-3">
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            // onClick={() => setCurrentStep(index + 1)}
            className={cn(
              'p-4 rounded-none transition-all cursor-context-men',
              currentStep === index + 1 ? 'bg-gray-100 border-l-4 border-orange-500' : 'hover:bg-gray-50'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', index === index + 1 ? 'bg-orange-100' : 'bg-gray-100')}>
                <step.icon className={cn('h-5 w-5', index === index + 1 ? 'text-orange-500' : 'text-gray-500')} />
              </div>
              <div>
                <h3 className={cn('font-medium text-sm', index === index + 1 ? 'text-orange-700' : 'text-gray-700')}>{step.title}</h3>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
