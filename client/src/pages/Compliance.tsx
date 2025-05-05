import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  FileText, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle, 
  Ban, 
  Lightbulb,
  CheckCircle2,
  XCircle,
  ClockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Compliance() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [location] = useLocation();
  
  const complianceScores = [
    {
      title: "Overall EUDR Compliance",
      score: 78,
      color: "bg-primary-600",
      description: "Your overall compliance score"
    },
    {
      title: "Documentation Completion",
      score: 84,
      color: "bg-blue-500",
      description: "Required documents submitted"
    },
    {
      title: "Supplier Compliance",
      score: 62,
      color: "bg-amber-500",
      description: "Supplier documentation status"
    },
    {
      title: "Risk Assessment",
      score: 93,
      color: "bg-green-500",
      description: "Risk management procedures"
    }
  ];
  
  const nonComplianceIncidents = [
    {
      id: 1,
      title: "Missing Supplier Documentation",
      supplier: "Green Palm Farms",
      severity: "high",
      status: "open",
      date: "2023-04-12"
    },
    {
      id: 2,
      title: "Incomplete Risk Assessment",
      supplier: "Global Coffee Traders",
      severity: "medium",
      status: "in-progress",
      date: "2023-04-08"
    },
    {
      id: 3,
      title: "Late Declaration Submission",
      supplier: "Cacao Harvest Co.",
      severity: "low",
      status: "resolved",
      date: "2023-03-28"
    },
    {
      id: 4,
      title: "Missing Product Traceability Data",
      supplier: "Amazonia Rubber Inc.",
      severity: "medium",
      status: "open",
      date: "2023-03-22"
    }
  ];
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-red-600">Open</span>
          </div>
        );
      case 'in-progress':
        return (
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 text-amber-600 mr-1" />
            <span className="text-amber-600">In Progress</span>
          </div>
        );
      case 'resolved':
        return (
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">Resolved</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout title={t('nav.compliance')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className={cn("md:flex md:items-center md:justify-between mb-6", isRTL && "md:flex-row-reverse")}>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Compliance Overview
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t('pages.compliance.description')}
            </p>
          </div>
          <div className={cn("mt-4 flex gap-3 md:mt-0", isRTL && "flex-row-reverse")}>
            <Button variant="outline">
              <BarChart3 className={cn(isRTL ? "ml-2" : "mr-2", "h-4 w-4")} />
              Generate Report
            </Button>
            <Link href="/declarations">
              <Button className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                <FileText className={cn(isRTL ? "ml-2" : "mr-2", "h-4 w-4")} />
                EUDR Declarations
                <ChevronRight className={cn(isRTL ? "mr-1 rtl-flip" : "ml-1", "h-4 w-4")} />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Compliance Score Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {complianceScores.map((score, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="px-4 py-3 bg-white border-b border-gray-200">
                <CardTitle className="text-base font-semibold text-gray-900">{score.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-4 pt-2 bg-white">
                <CardDescription className="text-xs text-gray-500 mb-3">{score.description}</CardDescription>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-gray-900">{score.score}%</span>
                  <div className="rounded-full p-1.5 flex items-center justify-center">
                  {score.score >= 80 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : score.score >= 60 ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  </div>
                </div>
                <Progress 
                  value={score.score} 
                  className={`h-1.5 rounded-sm ${score.color} transition-all duration-300`} 
                />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Non-Compliance Incidents */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden mb-8">
          <CardHeader className="px-4 py-3 bg-white border-b border-gray-200 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">
              Non-Compliance Incidents
            </CardTitle>
            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 px-2.5 py-0.5 rounded-full text-xs font-medium border-0">
              {nonComplianceIncidents.filter(i => i.status === 'open').length} Open Issues
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {nonComplianceIncidents.map((incident) => (
                  <li key={incident.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className="flex-shrink-0">
                          {incident.status === 'open' ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          ) : incident.status === 'in-progress' ? (
                            <ClockIcon className="h-5 w-5 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                          <div className="text-xs text-gray-500">
                            Supplier: {incident.supplier} | Reported: {incident.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-8 sm:ml-0">
                        {getSeverityBadge(incident.severity)}
                        <div className="ml-2 hidden sm:flex">{getStatusBadge(incident.status)}</div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                          <span className="sr-only">View details</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-center">
            <Button variant="link" className="text-blue-600 h-8 px-2 py-0">View All Compliance Issues</Button>
          </div>
        </Card>
        
        {/* Compliance Tips */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="px-4 py-3 border-b border-gray-200 flex flex-row items-center">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
            <CardTitle className="text-base font-semibold text-gray-900">Compliance Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className={cn("flex items-start", isRTL && "flex-row-reverse text-right")}>
                <ShieldCheck className={cn("h-4 w-4 mt-0.5 text-green-600 flex-shrink-0", isRTL ? "ml-3" : "mr-3")} />
                <p className="text-sm text-gray-700">Ensure all suppliers have completed their due diligence documentation</p>
              </div>
              <div className={cn("flex items-start", isRTL && "flex-row-reverse text-right")}>
                <ShieldCheck className={cn("h-4 w-4 mt-0.5 text-green-600 flex-shrink-0", isRTL ? "ml-3" : "mr-3")} />
                <p className="text-sm text-gray-700">Regularly monitor changes in EUDR compliance requirements</p>
              </div>
              <div className={cn("flex items-start", isRTL && "flex-row-reverse text-right")}>
                <ShieldCheck className={cn("h-4 w-4 mt-0.5 text-green-600 flex-shrink-0", isRTL ? "ml-3" : "mr-3")} />
                <p className="text-sm text-gray-700">Conduct quarterly risk assessments for high-risk suppliers</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <Button variant="link" className="text-blue-600 p-0 h-8">
              Read Compliance Guide
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}