from jet.dashboard.dashboard import Dashboard
from jet.dashboard.modules import DashboardModule
from django.utils.safestring import mark_safe
from .admin_views import (
    get_disaster_counts,
    get_disaster_counts_by_year,
    disaster_counts_by_region,
    get_user_stats,
)
import json


class TotalUsersModule(DashboardModule):
    title = 'Total Users'

    def render(self):
        stats = get_user_stats()
        return mark_safe(f"""
            <div style="padding: 20px 16px; text-align: center;">
                <div style="font-size: 48px; font-weight: 700; color: #0f172a; line-height: 1;">
                    {stats['total']}
                </div>
                <div style="margin-top: 8px; font-size: 13px; color: #64748b; font-weight: 500;">
                    Registered users
                </div>
                <div style="display: flex; justify-content: center; gap: 24px; margin-top: 20px; flex-wrap: wrap;">
                    <div>
                        <div style="font-size: 20px; font-weight: 600; color: #334155;">{stats['active']}</div>
                        <div style="font-size: 12px; color: #94a3b8;">Active</div>
                    </div>
                    <div>
                        <div style="font-size: 20px; font-weight: 600; color: #334155;">{stats['verified']}</div>
                        <div style="font-size: 12px; color: #94a3b8;">Verified</div>
                    </div>
                    <div>
                        <div style="font-size: 20px; font-weight: 600; color: #334155;">{stats['normal']}</div>
                        <div style="font-size: 12px; color: #94a3b8;">Normal</div>
                    </div>
                    <div>
                        <div style="font-size: 20px; font-weight: 600; color: #334155;">{stats['organization']}</div>
                        <div style="font-size: 12px; color: #94a3b8;">Organization</div>
                    </div>
                </div>
            </div>
        """)


class DisasterPieChartModule(DashboardModule):
    title = 'Disasters by Type (Pie Chart)'

    def render(self):
        disaster_data = get_disaster_counts()

        labels = [item['disasterType'] for item in disaster_data]
        counts = [item['count'] for item in disaster_data]

        labels_json = json.dumps(labels)
        counts_json = json.dumps(counts)

        return mark_safe(f"""
            <canvas id="disasterPieChart" width="600" height="400"></canvas>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
            const ctx = document.getElementById('disasterPieChart').getContext('2d');
            new Chart(ctx, {{
                type: 'pie',
                data: {{
                    labels: {labels_json},
                    datasets: [{{
                        label: 'Disaster Counts',
                        data: {counts_json},
                        backgroundColor: [
                            'rgba(255, 99, 132 )',
                            'rgba(255, 206, 86 )',
                            'rgba(54, 162, 235 )',
                            'rgba(75, 192, 192 )',
                            'rgba(153, 102, 255)',
                            'rgba(255, 159, 64 )'
                        ],
                        borderColor: 'rgba(255,255,255,1)',
                        borderWidth: 1
                    }}]
                }},
                options: {{
                    responsive: false,
                    plugins: {{
                        legend: {{
                            position: 'right'
                        }},
                        title: {{
                            display: true,
                            text: 'Disasters by Type'
                        }}
                    }}
                }}
            }});
            </script>
        """)


class DisasterContinentModule(DashboardModule):
    title = 'Disasters by Region'

    def render(self):
        disaster_data = disaster_counts_by_region()

        labels = [item['continent'] for item in disaster_data]
        counts = [item['count'] for item in disaster_data]

        labels_json = json.dumps(labels)
        counts_json = json.dumps(counts)

        bar_colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
        ]
        background_colors = json.dumps([bar_colors[i % len(bar_colors)] for i in range(len(labels))])

        return mark_safe(f"""
            <canvas id="disasterRegionBarChart" width="600" height="400"></canvas>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
            const ctxRegion = document.getElementById('disasterRegionBarChart').getContext('2d');
            new Chart(ctxRegion, {{
            type: 'bar',
            data: {{
                labels: {labels_json},
                datasets: [{{
                label: 'Disaster Counts by Region',
                data: {counts_json},
                backgroundColor: {background_colors},
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
                }}]
            }},
            options: {{
                responsive: false,
                scales: {{
                y: {{
                    beginAtZero: true
                }}
                }},
                plugins: {{
                title: {{
                    display: true,
                    text: 'Disasters by Region'
                }},
                legend: {{
                    display: false
                }}
                }}
            }}
            }});
            </script>
        """)


class DisasterRateModule(DashboardModule):
    title = 'Disasters Over the Years (Line Chart)'

    def render(self):
        disaster_data = get_disaster_counts_by_year()

        labels = [item['year'] for item in disaster_data]
        counts = [item['count'] for item in disaster_data]

        labels_json = json.dumps(labels)
        counts_json = json.dumps(counts)

        return mark_safe(f"""
            <canvas id="disasterLineChart" width="600" height="400"></canvas>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
            const ctxLine = document.getElementById('disasterLineChart').getContext('2d');
            new Chart(ctxLine, {{
                type: 'line',
                data: {{
                    labels: {labels_json},
                    datasets: [{{
                        label: 'Disaster Inc/Dec Counts',
                        data: {counts_json},
                        fill: false,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }}]
                }},
                options: {{
                    responsive: false,
                    scales: {{
                        y: {{
                            beginAtZero: true,
                            title: {{
                                display: true,
                                text: 'Number of Disasters'
                            }}
                        }},
                        x: {{
                            title: {{
                                display: true,
                                text: 'Year'
                            }}
                        }}
                    }},
                    plugins: {{
                        title: {{
                            display: true,
                            text: 'Disasters Inc/Dec Over the Years'
                        }},
                        legend: {{
                            display: true
                        }}
                    }}
                }}
            }});
            </script>
        """)


class CustomIndexDashboard(Dashboard):
    columns = 2

    def init_with_context(self, context):
        # available_children = widgets users can add via the "+" menu
        self.available_children.append(TotalUsersModule)
        self.available_children.append(DisasterPieChartModule)
        self.available_children.append(DisasterContinentModule)
        self.available_children.append(DisasterRateModule)

        # Default layout for first-time dashboards
        self.children.append(TotalUsersModule(column=0, order=0))
        self.children.append(DisasterPieChartModule(column=0, order=1))
        self.children.append(DisasterContinentModule(column=1, order=0))
        self.children.append(DisasterRateModule(column=0, order=2))

    def load_modules(self):
        """Ensure Total Users appears even for already-saved Jet layouts."""
        from jet.dashboard.models import UserDashboardModule

        super().load_modules()

        user = self.context['request'].user
        module_path = TotalUsersModule().fullname()
        already_present = any(
            getattr(m, 'model', None) and m.model.module == module_path
            for m in (self.modules or [])
        )
        if already_present:
            return

        model = UserDashboardModule.objects.create(
            title=TotalUsersModule.title,
            app_label=self.app_label,
            user=user,
            module=module_path,
            column=0,
            order=-1,  # pin above existing widgets
            settings=TotalUsersModule().dump_settings(),
            children=TotalUsersModule().dump_children(),
        )
        module = TotalUsersModule(model=model, context=self.context)
        self.modules = [module] + list(self.modules or [])
