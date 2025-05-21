import React, { useEffect, useState, useCallback } from 'react';
import OfficerSidebar from '../components/OfficerSidebar';
import { getDashboardAnalytics } from '../services/analyticsService';
import '../styles/OfficerDashboardPage.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { FaBars, FaChevronDown, FaChevronUp, FaRedo } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const OfficerDashboardPage = () => {
  const [officer, setOfficer] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState({
    membership: false,
    payment: false,
    events: false,
    clearance: false,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [membershipTab, setMembershipTab] = useState('all'); // 'all', '1st', '2nd'
  const [paymentTab, setPaymentTab] = useState('all'); // 'all', '1st', '2nd'
  const [visibleSeries, setVisibleSeries] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    membership: false,
    payment: false,
    events: false,
    clearance: false,
  });
  const [error, setError] = useState(null);
  const token = localStorage.getItem('officerAccessToken');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedOfficer = localStorage.getItem('officerInfo');
      const officerData = storedOfficer ? JSON.parse(storedOfficer) : null;
      console.log('Officer Data:', officerData);
      setOfficer(officerData);

      if (token) {
        setSectionLoading({ membership: true, payment: true, events: true, clearance: true });
        const analyticsData = await getDashboardAnalytics(token, {});
        console.log('Analytics Data:', analyticsData);
        if (!analyticsData || typeof analyticsData !== 'object') {
          throw new Error('Invalid analytics data received');
        }
        setAnalytics(analyticsData);
        setVisibleSeries({
          membersByRequirement: { count: true },
          paymentDetails: { Verifying: true, Paid: true, 'Not Paid': true },
          events: { participation_rate: true },
          popularEvents: analyticsData?.eventsEngagement?.popularEvents?.reduce((acc, evt) => ({ ...acc, [evt.title]: true }), {}) || {},
          clearanceByRequirement: { Clear: true, Processing: true, 'Not Yet Cleared': true },
          complianceByYear: { Clear: true, Processing: true, 'Not Yet Cleared': true },
        });
      } else {
        console.warn('No officerAccessToken found in localStorage');
        setError('Authentication token missing. Please log in again.');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
      setSectionLoading({ membership: false, payment: false, events: false, clearance: false });
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLegendClick = (chartKey, dataKey) => {
    setVisibleSeries(prev => ({
      ...prev,
      [chartKey]: {
        ...prev[chartKey],
        [dataKey]: !prev[chartKey][dataKey],
      },
    }));
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMembershipTabChange = (tab) => {
    setMembershipTab(tab);
  };

  const handlePaymentTabChange = (tab) => {
    setPaymentTab(tab);
  };

  if (isLoading) {
    return <div className="loading">Loading Officer Dashboard...</div>;
  }

  if (error || !officer || !analytics) {
    return (
      <div className="error-message">
        {error || 'Unable to load dashboard data. Please try again later.'}
        <button
          onClick={fetchData}
          className="retry-button"
          style={{ marginTop: 'var(--spacing-md)' }}
          aria-label="Retry loading data"
        >
          <FaRedo style={{ marginRight: 'var(--spacing-sm)' }} /> Retry
        </button>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const membershipInsights = analytics.membershipInsights || {};
  const paymentAnalytics = analytics.paymentAnalytics || {};
  const membersByRequirementData = Object.entries(membershipInsights.membersByRequirement || {}).map(
    ([requirement, count]) => ({ requirement, count })
  );

  const preferredPaymentData = paymentAnalytics.preferredPaymentMethods || [];
  const transformPaymentDetails = (data) => {
    const arr = [];
    Object.entries(data || {}).forEach(([requirement, years]) => {
      Object.entries(years || {}).forEach(([year, statuses]) => {
        arr.push({
          label: `${requirement} (${year})`,
          requirement,
          year,
          Verifying: statuses.Verifying || 0,
          Paid: statuses.paid || 0,
          'Not Paid': statuses['Not Paid'] || 0,
        });
      });
    });
    return arr;
  };
  const paymentDetailsData = transformPaymentDetails(paymentAnalytics.byRequirementAndYear);

  const semesterPaymentData = paymentTab === '1st'
    ? preferredPaymentData.map(method => ({
        method: method.method,
        count: method.firstSemCount,
      }))
    : paymentTab === '2nd'
    ? preferredPaymentData.map(method => ({
        method: method.method,
        count: method.secondSemCount,
      }))
    : preferredPaymentData;

  const paymentStats = {
    verifying: paymentTab === '1st'
      ? (paymentAnalytics.verifyingFirstSem || 0)
      : paymentTab === '2nd'
      ? (paymentAnalytics.verifyingSecondSem || 0)
      : ((paymentAnalytics.verifyingFirstSem || 0) + (paymentAnalytics.verifyingSecondSem || 0)),
    paid: paymentTab === '1st'
      ? (paymentAnalytics.paidFirstSem || 0)
      : paymentTab === '2nd'
      ? (paymentAnalytics.paidSecondSem || 0)
      : ((paymentAnalytics.paidFirstSem || 0) + (paymentAnalytics.paidSecondSem || 0)),
    notPaid: paymentTab === '1st'
      ? (paymentAnalytics.notPaidFirstSem || 0)
      : paymentTab === '2nd'
      ? (paymentAnalytics.notPaidSecondSem || 0)
      : ((paymentAnalytics.notPaidFirstSem || 0) + (paymentAnalytics.notPaidSecondSem || 0)),
  };

  const eventsEngagement = analytics.eventsEngagement || {};
  const eventsData = eventsEngagement.events || [];
  const popularEvents = eventsEngagement.popularEvents || [];
  const popularEventsPieData = popularEvents.map(evt => ({
    name: evt.title,
    value: evt.participant_count || 0,
  }));

  const clearanceTracking = analytics.clearanceTracking || {};
  const clearanceByRequirementData = Object.entries(clearanceTracking.byRequirement || {}).map(
    ([requirement, statuses]) => ({
      requirement,
      Clear: statuses.Clear || 0,
      Processing: statuses.Processing || 0,
      'Not Yet Cleared': statuses['Not Yet Cleared'] || 0,
    })
  );
  const complianceByYearData = Object.entries(clearanceTracking.complianceByYear || {}).map(
    ([year, statuses]) => ({
      year,
      Clear: statuses.Clear || 0,
      Processing: statuses.Processing || 0,
      'Not Yet Cleared': statuses['Not Yet Cleared'] || 0,
    })
  );

  const filteredMembersByRequirementData = membershipTab === 'all'
    ? membersByRequirementData
    : membersByRequirementData.filter(data => data.requirement === `${membershipTab === '1st' ? '1st' : '2nd'} Semester Membership`);

  const filteredPaymentDetailsData = paymentTab === 'all'
    ? paymentDetailsData
    : paymentDetailsData.filter(data => data.requirement === `${paymentTab === '1st' ? '1st' : '2nd'} Semester Membership`);

  const noneSpecsCount = membershipTab === '1st'
    ? (membershipInsights.noneSpecsFirstSem || membershipInsights.noneSpecs || 0)
    : membershipTab === '2nd'
    ? (membershipInsights.noneSpecsSecondSem || membershipInsights.noneSpecs || 0)
    : (membershipInsights.noneSpecs || 0);

  return (
    <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`} aria-label="Officer Dashboard">
      <OfficerSidebar officer={officer} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="main-content">
        <div className="dashboard-header sticky">
          <div className="dashboard-left">
            <h1 className="dashboard-title">
              <button
                className="sidebar-toggle-inside"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                <FaBars aria-hidden="true" />
              </button>
              Officer Dashboard
            </h1>
          </div>
        </div>

        {/* Membership Insights with Tabs */}
        <div className="card analytics-section">
          <div className="section-header" onClick={() => toggleSection('membership')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('membership')}>
            <h2>Membership Insights</h2>
            {collapsedSections.membership ? <FaChevronUp aria-hidden="true" /> : <FaChevronDown aria-hidden="true" />}
          </div>
          {!collapsedSections.membership && (
            sectionLoading.membership ? (
              <div className="section-loading">Loading Membership Insights...</div>
            ) : (
              <>
                <div className="membership-tabs">
                  <button
                    className={`tab-button ${membershipTab === 'all' ? 'active' : ''}`}
                    onClick={() => handleMembershipTabChange('all')}
                    aria-label="Show all semesters membership data"
                  >
                    All Semesters
                  </button>
                  <button
                    className={`tab-button ${membershipTab === '1st' ? 'active' : ''}`}
                    onClick={() => handleMembershipTabChange('1st')}
                    aria-label="Show 1st semester membership data"
                  >
                    1st Semester
                  </button>
                  <button
                    className={`tab-button ${membershipTab === '2nd' ? 'active' : ''}`}
                    onClick={() => handleMembershipTabChange('2nd')}
                    aria-label="Show 2nd semester membership data"
                  >
                    2nd Semester
                  </button>
                </div>
                <div className="tab-content">
                  {membershipTab === 'all' && (
                    <>
                      <div className="stats-row">
                        <div className="stat-box" data-tooltip-id="cs-students-tooltip" data-tooltip-content="Total number of CS students registered">
                          <p>Total CS Students</p>
                          <h2>{membershipInsights.totalCSStudents || 0}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="specs-members-tooltip" data-tooltip-content="Members who have paid their dues">
                          <p>Total Specs Members</p>
                          <h2>{membershipInsights.totalSpecsMembers || 0}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="none-specs-tooltip" data-tooltip-content="Members who haven't paid or are still processing">
                          <p>None Specs</p>
                          <h2>{noneSpecsCount}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="active-members-tooltip" data-tooltip-content="Members active in the last 30 days">
                          <p>Active Members</p>
                          <h2>{membershipInsights.activeMembers || 0}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="inactive-members-tooltip" data-tooltip-content="Members not active in the last 30 days">
                          <p>Inactive Members</p>
                          <h2>{membershipInsights.inactiveMembers || 0}</h2>
                        </div>
                      </div>
                      <div className="chart-box">
                        <h3>Members by Requirement</h3>
                        {filteredMembersByRequirementData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredMembersByRequirementData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="requirement" />
                              <YAxis />
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('membersByRequirement', e.dataKey)} verticalAlign="bottom" />
                              {visibleSeries.membersByRequirement?.count && (
                                <Bar dataKey="count" fill="#3B82F6" name="Specs Members" />
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p>No data available.</p>}
                      </div>
                    </>
                  )}
                  {membershipTab === '1st' && (
                    <>
                      <div className="stats-row">
                        <div className="stat-box" data-tooltip-id="cs-students-tooltip" data-tooltip-content="Total number of CS students registered">
                          <p>Total CS Students</p>
                          <h2>{membershipInsights.totalCSStudents || 0}</h2>
                        </div>
                        <div className="stat-box-semester" data-tooltip-id="specs-members-first-sem-tooltip" data-tooltip-content="Members who paid dues in 1st semester">
                          <p>Specs Members (1st Sem)</p>
                          <h2>{membershipInsights.totalSpecsMembersFirstSem || 0}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="none-specs-tooltip" data-tooltip-content="Members who haven't paid or are still processing in 1st semester">
                          <p>None Specs</p>
                          <h2>{noneSpecsCount}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="active-members-tooltip" data-tooltip-content="Members active in the last 30 days">
                          <p>Active Members</p>
                          <h2>{membershipInsights.activeMembers || 0}</h2>
                        </div>
                      </div>
                      <div className="chart-box">
                        <h3>Members by Requirement (1st Semester)</h3>
                        {filteredMembersByRequirementData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredMembersByRequirementData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="requirement" />
                              <YAxis />
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('membersByRequirement', e.dataKey)} verticalAlign="bottom" />
                              {visibleSeries.membersByRequirement?.count && (
                                <Bar dataKey="count" fill="#3B82F6" name="Specs Members" />
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p>No data available for 1st Semester.</p>}
                      </div>
                    </>
                  )}
                  {membershipTab === '2nd' && (
                    <>
                      <div className="stats-row">
                        <div className="stat-box" data-tooltip-id="cs-students-tooltip" data-tooltip-content="Total number of CS students registered">
                          <p>Total CS Students</p>
                          <h2>{membershipInsights.totalCSStudents || 0}</h2>
                        </div>
                        <div className="stat-box-semester" data-tooltip-id="specs-members-second-sem-tooltip" data-tooltip-content="Members who paid dues in 2nd semester">
                          <p>Specs Members (2nd Sem)</p>
                          <h2>{membershipInsights.totalSpecsMembersSecondSem || 0}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="none-specs-tooltip" data-tooltip-content="Members who haven't paid or are still processing in 2nd semester">
                          <p>None Specs</p>
                          <h2>{noneSpecsCount}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="active-members-tooltip" data-tooltip-content="Members active in the last 30 days">
                          <p>Active Members</p>
                          <h2>{membershipInsights.activeMembers || 0}</h2>
                        </div>
                      </div>
                      <div className="chart-box">
                        <h3>Members by Requirement (2nd Semester)</h3>
                        {filteredMembersByRequirementData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredMembersByRequirementData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="requirement" />
                              <YAxis />
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('membersByRequirement', e.dataKey)} verticalAlign="bottom" />
                              {visibleSeries.membersByRequirement?.count && (
                                <Bar dataKey="count" fill="#10B981" name="Specs Members" />
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p>No data available for 2nd Semester.</p>}
                      </div>
                    </>
                  )}
                </div>
              </>
            )
          )}
        </div>

        {/* Payment Analytics with Tabs */}
        <div className="card analytics-section">
          <div className="section-header" onClick={() => toggleSection('payment')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('payment')}>
            <h2>Payment Analytics</h2>
            {collapsedSections.payment ? <FaChevronUp aria-hidden="true" /> : <FaChevronDown aria-hidden="true" />}
          </div>
          {!collapsedSections.payment && (
            sectionLoading.payment ? (
              <div className="section-loading">Loading Payment Analytics...</div>
            ) : (
              <>
                <div className="payment-tabs">
                  <button
                    className={`tab-button ${paymentTab === 'all' ? 'active' : ''}`}
                    onClick={() => handlePaymentTabChange('all')}
                    aria-label="Show all semesters payment data"
                  >
                    All Semesters
                  </button>
                  <button
                    className={`tab-button ${paymentTab === '1st' ? 'active' : ''}`}
                    onClick={() => handlePaymentTabChange('1st')}
                    aria-label="Show 1st semester payment data"
                  >
                    1st Semester
                  </button>
                  <button
                    className={`tab-button ${paymentTab === '2nd' ? 'active' : ''}`}
                    onClick={() => handlePaymentTabChange('2nd')}
                    aria-label="Show 2nd semester payment data"
                  >
                    2nd Semester
                  </button>
                </div>
                <div className="tab-content">
                  {paymentTab === 'all' && (
                    <>
                      <div className="stats-row">
                        <div className="stat-box" data-tooltip-id="verifying-tooltip" data-tooltip-content="Payments under verification">
                          <p>Verifying</p>
                          <h2>{paymentStats.verifying}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="paid-tooltip" data-tooltip-content="Members with confirmed payments">
                          <p>Paid</p>
                          <h2>{paymentStats.paid}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="not-paid-tooltip" data-tooltip-content="Members who haven't paid">
                          <p>Not Paid</p>
                          <h2>{paymentStats.notPaid}</h2>
                        </div>
                      </div>
                      <div className="chart-box">
                        <h3>Preferred Payment Methods</h3>
                        {preferredPaymentData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={preferredPaymentData}
                                dataKey="count"
                                nameKey="method"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#3B82F6"
                                label
                              >
                                {preferredPaymentData.map((entry, index) => (
                                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('preferredPayment', e.dataKey)} verticalAlign="bottom" />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : <p>No preferred payment methods data.</p>}
                      </div>
                      <div className="chart-box">
                        <h3>Payment Details by Requirement & Year</h3>
                        {paymentDetailsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={paymentDetailsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('paymentDetails', e.dataKey)} verticalAlign="bottom" />
                              {visibleSeries.paymentDetails?.Verifying && (
                                <Bar dataKey="Verifying" fill="#F59E0B" />
                              )}
                              {visibleSeries.paymentDetails?.Paid && (
                                <Bar dataKey="Paid" fill="#10B981" />
                              )}
                              {visibleSeries.paymentDetails?.['Not Paid'] && (
                                <Bar dataKey="Not Paid" fill="#EF4444" />
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p>No payment details data available.</p>}
                      </div>
                    </>
                  )}
                  {paymentTab === '1st' && (
                    <>
                      <div className="stats-row">
                        <div className="stat-box" data-tooltip-id="verifying-tooltip" data-tooltip-content="Payments under verification in 1st semester">
                          <p>Verifying</p>
                          <h2>{paymentStats.verifying}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="paid-tooltip" data-tooltip-content="Members with confirmed payments in 1st semester">
                          <p>Paid</p>
                          <h2>{paymentStats.paid}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="not-paid-tooltip" data-tooltip-content="Members who haven't paid in 1st semester">
                          <p>Not Paid</p>
                          <h2>{paymentStats.notPaid}</h2>
                        </div>
                      </div>
                      <div className="chart-box">
                        <h3>Preferred Payment Methods (1st Semester)</h3>
                        {semesterPaymentData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={semesterPaymentData}
                                dataKey="count"
                                nameKey="method"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#3B82F6"
                                label
                              >
                                {semesterPaymentData.map((entry, index) => (
                                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('preferredPayment', e.dataKey)} verticalAlign="bottom" />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : <p>No payment methods data for 1st Semester.</p>}
                      </div>
                      <div className="chart-box">
                        <h3>Payment Details by Requirement & Year (1st Semester)</h3>
                        {filteredPaymentDetailsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredPaymentDetailsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('paymentDetails', e.dataKey)} verticalAlign="bottom" />
                              {visibleSeries.paymentDetails?.Verifying && (
                                <Bar dataKey="Verifying" fill="#F59E0B" />
                              )}
                              {visibleSeries.paymentDetails?.Paid && (
                                <Bar dataKey="Paid" fill="#3B82F6" />
                              )}
                              {visibleSeries.paymentDetails?.['Not Paid'] && (
                                <Bar dataKey="Not Paid" fill="#EF4444" />
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p>No payment details data available for 1st Semester.</p>}
                      </div>
                    </>
                  )}
                  {paymentTab === '2nd' && (
                    <>
                      <div className="stats-row">
                        <div className="stat-box" data-tooltip-id="verifying-tooltip" data-tooltip-content="Payments under verification in 2nd semester">
                          <p>Verifying</p>
                          <h2>{paymentStats.verifying}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="paid-tooltip" data-tooltip-content="Members with confirmed payments in 2nd semester">
                          <p>Paid</p>
                          <h2>{paymentStats.paid}</h2>
                        </div>
                        <div className="stat-box" data-tooltip-id="not-paid-tooltip" data-tooltip-content="Members who haven't paid in 2nd semester">
                          <p>Not Paid</p>
                          <h2>{paymentStats.notPaid}</h2>
                        </div>
                      </div>
                      <div className="chart-box">
                        <h3>Preferred Payment Methods (2nd Semester)</h3>
                        {semesterPaymentData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={semesterPaymentData}
                                dataKey="count"
                                nameKey="method"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#10B981"
                                label
                              >
                                {semesterPaymentData.map((entry, index) => (
                                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('preferredPayment', e.dataKey)} verticalAlign="bottom" />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : <p>No payment methods data for 2nd Semester.</p>}
                      </div>
                      <div className="chart-box">
                        <h3>Payment Details by Requirement & Year (2nd Semester)</h3>
                        {filteredPaymentDetailsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredPaymentDetailsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <Tooltip />
                              <Legend onClick={(e) => handleLegendClick('paymentDetails', e.dataKey)} verticalAlign="bottom" />
                              {visibleSeries.paymentDetails?.Verifying && (
                                <Bar dataKey="Verifying" fill="#F59E0B" />
                              )}
                              {visibleSeries.paymentDetails?.Paid && (
                                <Bar dataKey="Paid" fill="#10B981" />
                              )}
                              {visibleSeries.paymentDetails?.['Not Paid'] && (
                                <Bar dataKey="Not Paid" fill="#EF4444" />
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p>No payment details data available for 2nd Semester.</p>}
                      </div>
                    </>
                  )}
                </div>
              </>
            )
          )}
        </div>

        {/* Events Engagement */}
        <div className="card analytics-section">
          <div className="section-header" onClick={() => toggleSection('events')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('events')}>
            <h2>Events Engagement</h2>
            {collapsedSections.events ? <FaChevronUp aria-hidden="true" /> : <FaChevronDown aria-hidden="true" />}
          </div>
          {!collapsedSections.events && (
            sectionLoading.events ? (
              <div className="section-loading">Loading Events Engagement...</div>
            ) : (
              <>
                <div className="chart-box">
                  <h3>All Events - Participation Rate</h3>
                  {eventsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={eventsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" />
                        <YAxis label={{ value: 'Participation Rate (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend onClick={(e) => handleLegendClick('events', e.dataKey)} verticalAlign="bottom" />
                        {visibleSeries.events?.participation_rate && (
                          <Bar dataKey="participation_rate" fill="#10B981" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p>No events data available.</p>}
                </div>
                <div className="chart-box">
                  <h3>Popular Events</h3>
                  {popularEventsPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={popularEventsPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#3B82F6"
                          label
                        >
                          {popularEventsPieData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend onClick={(e) => handleLegendClick('popularEvents', e.dataKey)} verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p>No popular events data.</p>}
                </div>
              </>
            )
          )}
        </div>

        {/* Clearance Tracking */}
        <div className="card analytics-section">
          <div className="section-header" onClick={() => toggleSection('clearance')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('clearance')}>
            <h2>Clearance Tracking</h2>
            {collapsedSections.clearance ? <FaChevronUp aria-hidden="true" /> : <FaChevronDown aria-hidden="true" />}
          </div>
          {!collapsedSections.clearance && (
            sectionLoading.clearance ? (
              <div className="section-loading">Loading Clearance Tracking...</div>
            ) : (
              <>
                <div className="chart-box">
                  <h3>Clearance by Requirement</h3>
                  {clearanceByRequirementData.length > 0 ? (
                    clearanceByRequirementData.map((item, idx) => (
                      <ResponsiveContainer key={idx} width="100%" height={250}>
                        <BarChart data={[item]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="requirement" />
                          <YAxis />
                          <Tooltip />
                          <Legend onClick={(e) => handleLegendClick('clearanceByRequirement', e.dataKey)} verticalAlign="bottom" />
                          {visibleSeries.clearanceByRequirement?.Clear && (
                            <Bar dataKey="Clear" fill="#10B981" />
                          )}
                          {visibleSeries.clearanceByRequirement?.Processing && (
                            <Bar dataKey="Processing" fill="#F59E0B" />
                          )}
                          {visibleSeries.clearanceByRequirement?.['Not Yet Cleared'] && (
                            <Bar dataKey="Not Yet Cleared" fill="#EF4444" />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    ))
                  ) : <p>No clearance tracking data available.</p>}
                </div>
                <div className="chart-box">
                  <h3>Compliance by Year</h3>
                  {complianceByYearData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={complianceByYearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend onClick={(e) => handleLegendClick('complianceByYear', e.dataKey)} verticalAlign="bottom" />
                        {visibleSeries.complianceByYear?.Clear && (
                          <Bar dataKey="Clear" fill="#10B981" />
                        )}
                        {visibleSeries.complianceByYear?.Processing && (
                          <Bar dataKey="Processing" fill="#F59E0B" />
                        )}
                        {visibleSeries.complianceByYear?.['Not Yet Cleared'] && (
                          <Bar dataKey="Not Yet Cleared" fill="#EF4444" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p>No compliance data available.</p>}
                </div>
              </>
            )
          )}
        </div>

        <ReactTooltip id="cs-students-tooltip" place="top" />
        <ReactTooltip id="specs-members-tooltip" place="top" />
        <ReactTooltip id="specs-members-first-sem-tooltip" place="top" />
        <ReactTooltip id="specs-members-second-sem-tooltip" place="top" />
        <ReactTooltip id="active-members-tooltip" place="top" />
        <ReactTooltip id="inactive-members-tooltip" place="top" />
        <ReactTooltip id="none-specs-tooltip" place="top" />
        <ReactTooltip id="verifying-tooltip" place="top" />
        <ReactTooltip id="paid-tooltip" place="top" />
        <ReactTooltip id="not-paid-tooltip" place="top" />
      </div>
    </div>
  );
};

export default OfficerDashboardPage;