from jet.dashboard.dashboard import Dashboard
from jet.dashboard.modules import DashboardModule
from django.utils.safestring import mark_safe
from .admin_views import get_disaster_counts, get_disaster_counts_by_year, disaster_counts_by_region
import json


class DisasterPieChartModule(DashboardModule):
    title = 'Disasters by Type (Pie Chart)'

    def render(self):
        # Get data from admin_views.py
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
        # Fetch region and count from DB
        disaster_data = disaster_counts_by_region()

        # Extract region names and their counts
        labels = [item['continent'] for item in disaster_data]
        counts = [item['count'] for item in disaster_data]

        # Convert to JSON for JS
        labels_json = json.dumps(labels)
        counts_json = json.dumps(counts)

        # Return safe HTML and JS
        # Define a list of colors for each bar (repeat if not enough)
        bar_colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
        ]
        # Repeat colors if there are more regions than colors
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
        # Fetch year and count from DB
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
        self.children.append(DisasterPieChartModule())
        self.children.append(DisasterContinentModule())
        self.children.append(DisasterRateModule())
