import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Building, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';

interface Supplier {
  id: number;
  name: string;
  country: string;
  status: 'active' | 'pending' | 'flagged';
  productType: string;
}

export const SupplierList: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Sample data for suppliers
  const suppliers: Supplier[] = [
    {
      id: 1,
      name: 'PT Sustainable Oils',
      country: 'Indonesia',
      status: 'active',
      productType: 'Palm Oil',
    },
    {
      id: 2,
      name: 'Ghana Cocoa Board',
      country: 'Ghana',
      status: 'pending',
      productType: 'Cocoa',
    },
    {
      id: 3,
      name: 'Amazon Timber Ltd',
      country: 'Brazil',
      status: 'flagged',
      productType: 'Timber',
    },
  ];

  // Status badge color mapping
  const getStatusClasses = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ul className="divide-y divide-gray-200">
      {suppliers.map((supplier) => (
        <li key={supplier.id}>
          <Link href={`/suppliers/${supplier.id}`}>
            <div className="block hover:bg-gray-50 cursor-pointer">
              <div className="px-4 py-4 sm:px-6">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                    <div className="flex-shrink-0">
                      <span className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Building className="h-6 w-6 text-gray-500" />
                      </span>
                    </div>
                    <div className={cn("ml-4", isRTL && "mr-4 ml-0 text-right")}>
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.country}</div>
                    </div>
                  </div>
                  <div className={cn("ml-2 flex-shrink-0 flex", isRTL && "mr-2 ml-0")}>
                    <span className={cn(`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(supplier.status)}`)}>
                      {t(`supplier.status.${supplier.status}`)}
                    </span>
                  </div>
                </div>
                <div className={cn("mt-2 sm:flex sm:justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("mt-2 flex items-center text-sm text-gray-500 sm:mt-0", isRTL && "flex-row-reverse")}>
                    <Tag className={cn("flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400", isRTL && "ml-1.5 mr-0")} />
                    <span>{supplier.productType}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};
