import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
from django_plotly_dash import DjangoDash

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = DjangoDash('SimpleExample', external_stylesheets=external_stylesheets)


app.layout = html.Div([
    html.H3('Square Root Slider Graph'),
    dcc.Graph(id='slider-graph', animate=True, style={"backgroundColor": "#1a2d46", 'color': '#ffffff'}),
    dcc.Slider(
        id='slider-updatemode',
        marks={i: '{}'.format(i) for i in range(40)},
        max=40,
        value=5,
        step=1,
        updatemode='drag',
    ),
    html.Div(id='slide-updatemode'),
    dcc.RadioItems(
        id='segmentation-method',
        options=[{'label': i,
                  'value': j} for i, j in [('Equal width','Equal width'), ('RP+Snake','RP+snake')]],
        value='Equal width'
    ),
    # html.Div(id='segmentation-method'),
    html.P(id='segmentation-method-output'),

])


@app.callback(
               Output('slider-graph', 'figure'),
              [Input('slider-updatemode', 'value')])
def display_value(value):

    x = []
    for i in range(value):
        x.append(i)

    y = []
    for i in range(value):
        y.append(i*i)

    graph = go.Scatter(
        x=x,
        y=y,
        name='Manipulate Graph'
    )
    layout = go.Layout(
        paper_bgcolor='#27293d',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(range=[min(x), max(x)]),
        yaxis=dict(range=[min(y), max(y)]),
        font=dict(color='white'),

    )
    return {'data': [graph], 'layout': layout}


@app.callback(
    Output('segmentation-method-output', 'children'),
    [Input('segmentation-method', 'value')])
def getSegmentationOutput(value):
    return 'You have selected "{}"'.format(value)



